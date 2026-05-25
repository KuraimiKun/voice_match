import { Module } from '@nestjs/common';
import { SignalingGateway } from './signaling.gateway';
import { AuthModule } from '../auth/auth.module';
import { PresenceModule } from '../presence/presence.module';
import { MatchingModule } from '../matching/matching.module';
import { VoiceSessionsModule } from '../voice-sessions/voice-sessions.module';
import { FriendshipsModule } from '../friendships/friendships.module';
import { ChatRoomsModule } from '../chat-rooms/chat-rooms.module';
import { MessagesModule } from '../messages/messages.module';
import { BlocksModule } from '../blocks/blocks.module';
import { ReportsModule } from '../reports/reports.module';
@Module({ imports: [AuthModule, PresenceModule, MatchingModule, VoiceSessionsModule, FriendshipsModule, ChatRoomsModule, MessagesModule, BlocksModule, ReportsModule], providers: [SignalingGateway] })
export class SignalingModule {}
