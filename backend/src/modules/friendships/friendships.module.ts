import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '../../common/http/jwt-auth.guard';
import { BlocksModule } from '../blocks/blocks.module';
import { RateLimitModule } from '../rate-limit/rate-limit.module';
import { VoiceSessionsModule } from '../voice-sessions/voice-sessions.module';
import { FriendshipsController } from './friendships.controller';
import { FriendshipsService } from './friendships.service';

@Module({
  imports: [JwtModule.register({}), VoiceSessionsModule, BlocksModule, RateLimitModule],
  controllers: [FriendshipsController],
  providers: [FriendshipsService, JwtAuthGuard],
  exports: [FriendshipsService],
})
export class FriendshipsModule {}
