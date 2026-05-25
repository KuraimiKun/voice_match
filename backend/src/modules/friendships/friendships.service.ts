import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { normalizedPair } from '../../common/utils/pair-key';
import { VoiceSessionsService } from '../voice-sessions/voice-sessions.service';
import { ChatRoomsService } from '../chat-rooms/chat-rooms.service';
import { BlocksService } from '../blocks/blocks.service';

@Injectable()
export class FriendshipsService {
  constructor(private readonly prisma: PrismaService, private readonly voice: VoiceSessionsService, private readonly rooms: ChatRoomsService, private readonly blocks: BlocksService) {}

  async addCurrentPartner(requesterId: string, voiceSessionId: string) {
    const { partnerId } = await this.voice.partnerForSession(voiceSessionId, requesterId);
    if (await this.blocks.isEitherBlocked(requesterId, partnerId)) throw new ForbiddenException('friend_add_blocked');
    await this.prisma.friendAdd.upsert({
      where: { requesterId_targetId: { requesterId, targetId: partnerId } },
      update: { status: 'PENDING', voiceSessionId },
      create: { requesterId, targetId: partnerId, voiceSessionId },
    });
    const reciprocal = await this.prisma.friendAdd.findUnique({ where: { requesterId_targetId: { requesterId: partnerId, targetId: requesterId } } });
    if (!reciprocal) return { status: 'pending' as const, targetUserId: partnerId };

    const [userAId, userBId] = normalizedPair(requesterId, partnerId);
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.friendAdd.updateMany({ where: { OR: [{ requesterId, targetId: partnerId }, { requesterId: partnerId, targetId: requesterId }] }, data: { status: 'ACCEPTED' } });
      const friendship = await tx.friendship.upsert({ where: { userAId_userBId: { userAId, userBId } }, update: { deletedAt: null }, create: { userAId, userBId } });
      const chatRoom = await tx.chatRoom.upsert({ where: { friendshipId: friendship.id }, update: { deletedAt: null }, create: { friendshipId: friendship.id } });
      return { friendship, chatRoom };
    });
    return { status: 'created' as const, peerUserId: partnerId, ...result };
  }
  async listForUser(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: { deletedAt: null, OR: [{ userAId: userId }, { userBId: userId }] },
      include: { chatRoom: true },
      orderBy: { createdAt: 'desc' },
    });
    return { friendships: friendships.map((f) => ({ id: f.id, peerUserId: f.userAId === userId ? f.userBId : f.userAId, chatRoomId: f.chatRoom?.id ?? null, createdAt: f.createdAt })) };
  }
}
