import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PresenceModule } from './modules/presence/presence.module';
import { MatchingModule } from './modules/matching/matching.module';
import { VoiceSessionsModule } from './modules/voice-sessions/voice-sessions.module';
import { SignalingModule } from './modules/signaling/signaling.module';
import { FriendshipsModule } from './modules/friendships/friendships.module';
import { ChatRoomsModule } from './modules/chat-rooms/chat-rooms.module';
import { MessagesModule } from './modules/messages/messages.module';
import { BlocksModule } from './modules/blocks/blocks.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { RateLimitModule } from './modules/rate-limit/rate-limit.module';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    PresenceModule,
    MatchingModule,
    VoiceSessionsModule,
    SignalingModule,
    FriendshipsModule,
    ChatRoomsModule,
    MessagesModule,
    BlocksModule,
    ReportsModule,
    ModerationModule,
    RateLimitModule,
    HealthModule,
  ],
})
export class AppModule {}
