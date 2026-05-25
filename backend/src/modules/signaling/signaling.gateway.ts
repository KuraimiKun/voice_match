import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { BlocksService } from '../blocks/blocks.service';
import { ChatRoomsService } from '../chat-rooms/chat-rooms.service';
import { FriendshipsService } from '../friendships/friendships.service';
import { MatchingService } from '../matching/matching.service';
import { MessagesService } from '../messages/messages.service';
import { PresenceService } from '../presence/presence.service';
import { ReportsService } from '../reports/reports.service';
import { VoiceSessionsService } from '../voice-sessions/voice-sessions.service';
import {
  BlockUserPayloadDto,
  FriendAddCurrentPartnerPayloadDto,
  JoinChatRoomPayloadDto,
  ReportMessagePayloadDto,
  ReportUserPayloadDto,
  SendChatMessagePayloadDto,
  SignalingPayloadDto,
  SocketAuthenticatePayloadDto,
  VoiceSessionPayloadDto,
} from './dto/socket-payload.dto';
import { SocketEvents } from './socket-events';
import { SocketValidationPipe } from './socket-validation.pipe';

type ClientSocket = Socket & { data: { userId?: string; authenticated?: boolean } };

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class SignalingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(SignalingGateway.name);

  constructor(
    private readonly auth: AuthService,
    private readonly presence: PresenceService,
    private readonly matching: MatchingService,
    private readonly voice: VoiceSessionsService,
    private readonly friends: FriendshipsService,
    private readonly rooms: ChatRoomsService,
    private readonly messages: MessagesService,
    private readonly blocks: BlocksService,
    private readonly reports: ReportsService,
  ) {}

  handleConnection(socket: ClientSocket) {
    socket.data.authenticated = false;
  }

  async handleDisconnect(socket: ClientSocket) {
    const userId = await this.presence.markOfflineBySocket(socket.id);
    if (userId) await this.matching.stopSearching(userId);
  }

  @SubscribeMessage(SocketEvents.socketAuthenticate)
  async authenticate(
    @ConnectedSocket() socket: ClientSocket,
    @MessageBody(new SocketValidationPipe(SocketAuthenticatePayloadDto)) body: SocketAuthenticatePayloadDto,
  ) {
    try {
      const { userId } = await this.auth.verifySocketToken(body.token);
      socket.data.userId = userId;
      socket.data.authenticated = true;
      await this.presence.markOnline(userId, socket.id);
      socket.emit(SocketEvents.socketAuthenticated, { userId });
    } catch {
      socket.emit(SocketEvents.socketAuthError, { code: 'auth_failed' });
      socket.disconnect(true);
    }
  }

  @SubscribeMessage(SocketEvents.joinQueue)
  async joinQueue(@ConnectedSocket() socket: ClientSocket) {
    try {
      const userId = this.requireUser(socket);
      const result = await this.matching.joinQueue(userId, socket.id);
      if (result.status === 'waiting') return socket.emit(SocketEvents.waiting, {});
      this.server.to(result.a.socketId).emit(SocketEvents.matched, {
        voiceSessionId: result.session.id,
        partnerSocketId: result.b.socketId,
        initiator: true,
      });
      this.server.to(result.b.socketId).emit(SocketEvents.matched, {
        voiceSessionId: result.session.id,
        partnerSocketId: result.a.socketId,
        initiator: false,
      });
    } catch (e) {
      this.emitError(socket, e);
    }
  }

  @SubscribeMessage(SocketEvents.stopSearching)
  async stopSearching(@ConnectedSocket() socket: ClientSocket) {
    await this.matching.stopSearching(this.requireUser(socket));
  }

  @SubscribeMessage(SocketEvents.skip)
  async skip(
    @ConnectedSocket() socket: ClientSocket,
    @MessageBody(new SocketValidationPipe(VoiceSessionPayloadDto)) body: VoiceSessionPayloadDto,
  ) {
    await this.endAndNotify(socket, body.voiceSessionId, 'SKIPPED', 'skip');
  }

  @SubscribeMessage(SocketEvents.endCall)
  async endCall(
    @ConnectedSocket() socket: ClientSocket,
    @MessageBody(new SocketValidationPipe(VoiceSessionPayloadDto)) body: VoiceSessionPayloadDto,
  ) {
    await this.endAndNotify(socket, body.voiceSessionId, 'ENDED', 'end_call');
  }

  @SubscribeMessage(SocketEvents.offer)
  async offer(
    @ConnectedSocket() socket: ClientSocket,
    @MessageBody(new SocketValidationPipe(SignalingPayloadDto)) body: SignalingPayloadDto,
  ) {
    await this.relayToPartner(socket, body.voiceSessionId, SocketEvents.offer, { voiceSessionId: body.voiceSessionId, sdp: body.payload });
  }

  @SubscribeMessage(SocketEvents.answer)
  async answer(
    @ConnectedSocket() socket: ClientSocket,
    @MessageBody(new SocketValidationPipe(SignalingPayloadDto)) body: SignalingPayloadDto,
  ) {
    await this.relayToPartner(socket, body.voiceSessionId, SocketEvents.answer, { voiceSessionId: body.voiceSessionId, sdp: body.payload });
  }

  @SubscribeMessage(SocketEvents.iceCandidate)
  async ice(
    @ConnectedSocket() socket: ClientSocket,
    @MessageBody(new SocketValidationPipe(SignalingPayloadDto)) body: SignalingPayloadDto,
  ) {
    await this.relayToPartner(socket, body.voiceSessionId, SocketEvents.iceCandidate, { voiceSessionId: body.voiceSessionId, candidate: body.payload });
  }

  @SubscribeMessage(SocketEvents.friendAddCurrentPartner)
  async addFriend(
    @ConnectedSocket() socket: ClientSocket,
    @MessageBody(new SocketValidationPipe(FriendAddCurrentPartnerPayloadDto)) body: FriendAddCurrentPartnerPayloadDto,
  ) {
    try {
      const result = await this.friends.addCurrentPartner(this.requireUser(socket), body.voiceSessionId);
      if (result.status === 'pending') return socket.emit(SocketEvents.friendAddPending, result);
      socket.emit(SocketEvents.friendshipCreated, result);
      const peerSocket = await this.presence.socketForUser(result.peerUserId);
      if (peerSocket) this.server.to(peerSocket).emit(SocketEvents.friendshipCreated, result);
    } catch (e) {
      this.emitError(socket, e);
    }
  }

  @SubscribeMessage(SocketEvents.friendRoomsLoad)
  async loadRooms(@ConnectedSocket() socket: ClientSocket) {
    socket.emit(SocketEvents.friendRooms, await this.rooms.listForUser(this.requireUser(socket)));
  }

  @SubscribeMessage(SocketEvents.joinChatRoom)
  async joinRoom(
    @ConnectedSocket() socket: ClientSocket,
    @MessageBody(new SocketValidationPipe(JoinChatRoomPayloadDto)) body: JoinChatRoomPayloadDto,
  ) {
    try {
      const userId = this.requireUser(socket);
      await this.rooms.assertMember(body.roomId, userId);
      await socket.join(`chat:${body.roomId}`);
      socket.emit(SocketEvents.chatHistory, await this.messages.history(userId, body.roomId));
    } catch (e) {
      this.emitError(socket, e);
    }
  }

  @SubscribeMessage(SocketEvents.leaveChatRoom)
  async leaveRoom(
    @ConnectedSocket() socket: ClientSocket,
    @MessageBody(new SocketValidationPipe(JoinChatRoomPayloadDto)) body: JoinChatRoomPayloadDto,
  ) {
    await socket.leave(`chat:${body.roomId}`);
  }

  @SubscribeMessage(SocketEvents.chatMessageSend)
  async sendMessage(
    @ConnectedSocket() socket: ClientSocket,
    @MessageBody(new SocketValidationPipe(SendChatMessagePayloadDto)) body: SendChatMessagePayloadDto,
  ) {
    try {
      const result = await this.messages.send(this.requireUser(socket), body.roomId, body.body);
      this.server.to(`chat:${body.roomId}`).emit(SocketEvents.chatMessageNew, result);
    } catch (e) {
      this.emitError(socket, e);
    }
  }

  @SubscribeMessage(SocketEvents.typingStart)
  async typingStart(
    @ConnectedSocket() socket: ClientSocket,
    @MessageBody(new SocketValidationPipe(JoinChatRoomPayloadDto)) body: JoinChatRoomPayloadDto,
  ) {
    await this.relayTyping(socket, body.roomId, SocketEvents.typingStart);
  }

  @SubscribeMessage(SocketEvents.typingStop)
  async typingStop(
    @ConnectedSocket() socket: ClientSocket,
    @MessageBody(new SocketValidationPipe(JoinChatRoomPayloadDto)) body: JoinChatRoomPayloadDto,
  ) {
    await this.relayTyping(socket, body.roomId, SocketEvents.typingStop);
  }

  @SubscribeMessage(SocketEvents.reportUser)
  async reportUser(
    @ConnectedSocket() socket: ClientSocket,
    @MessageBody(new SocketValidationPipe(ReportUserPayloadDto)) body: ReportUserPayloadDto,
  ) {
    try {
      socket.emit('report_created', await this.reports.create(this.requireUser(socket), {
        type: 'VOICE_SESSION',
        reason: body.reason ?? 'OTHER',
        voiceSessionId: body.voiceSessionId,
        reportedUserId: body.reportedUserId,
        details: body.details,
      }));
    } catch (e) {
      this.emitError(socket, e);
    }
  }

  @SubscribeMessage(SocketEvents.reportMessage)
  async reportMessage(
    @ConnectedSocket() socket: ClientSocket,
    @MessageBody(new SocketValidationPipe(ReportMessagePayloadDto)) body: ReportMessagePayloadDto,
  ) {
    try {
      socket.emit('report_created', await this.reports.create(this.requireUser(socket), {
        type: 'MESSAGE',
        reason: body.reason ?? 'OTHER',
        messageId: body.messageId,
        details: body.details,
      }));
    } catch (e) {
      this.emitError(socket, e);
    }
  }

  @SubscribeMessage(SocketEvents.blockUser)
  async blockUser(
    @ConnectedSocket() socket: ClientSocket,
    @MessageBody(new SocketValidationPipe(BlockUserPayloadDto)) body: BlockUserPayloadDto,
  ) {
    try {
      const userId = this.requireUser(socket);
      let targetUserId = body.targetUserId;
      if (!targetUserId && body.voiceSessionId) {
        targetUserId = (await this.voice.partnerForSession(body.voiceSessionId, userId)).partnerId;
      }
      if (!targetUserId) throw new Error('block_target_required');
      const result = await this.blocks.blockUser(userId, targetUserId, body.reason);
      if (body.voiceSessionId) await this.endAndNotify(socket, body.voiceSessionId, 'BLOCKED', 'block');
      socket.emit(SocketEvents.userBlocked, result);
    } catch (e) {
      this.emitError(socket, e);
    }
  }

  private requireUser(socket: ClientSocket): string {
    if (!socket.data.authenticated || !socket.data.userId) throw new Error('socket_not_authenticated');
    return socket.data.userId;
  }

  private async relayToPartner(socket: ClientSocket, voiceSessionId: string, event: string, payload: unknown) {
    try {
      const { partnerId } = await this.voice.activePartnerForSession(voiceSessionId, this.requireUser(socket));
      await this.voice.markSignaling(voiceSessionId, this.requireUser(socket));
      const partnerSocket = await this.presence.socketForUser(partnerId);
      if (partnerSocket) this.server.to(partnerSocket).emit(event, payload);
    } catch (e) {
      this.emitError(socket, e);
    }
  }

  private async endAndNotify(socket: ClientSocket, voiceSessionId: string, status: 'ENDED' | 'SKIPPED' | 'DISCONNECTED' | 'BLOCKED', reason: string) {
    try {
      const userId = this.requireUser(socket);
      const { partnerId } = await this.voice.partnerForSession(voiceSessionId, userId);
      await this.voice.end(voiceSessionId, userId, status, reason);
      const partnerSocket = await this.presence.socketForUser(partnerId);
      if (partnerSocket) this.server.to(partnerSocket).emit(SocketEvents.partnerLeft, { voiceSessionId, reason });
    } catch (e) {
      this.emitError(socket, e);
    }
  }

  private async relayTyping(socket: ClientSocket, roomId: string, event: string) {
    try {
      await this.rooms.assertMember(roomId, this.requireUser(socket));
      socket.to(`chat:${roomId}`).emit(event, { roomId });
    } catch (e) {
      this.emitError(socket, e);
    }
  }

  private emitError(socket: ClientSocket, e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown_error';
    this.logger.warn(message);
    socket.emit(SocketEvents.errorMessage, { code: message });
  }
}
