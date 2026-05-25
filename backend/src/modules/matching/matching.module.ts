import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { BlocksModule } from '../blocks/blocks.module';
import { VoiceSessionsModule } from '../voice-sessions/voice-sessions.module';
import { RateLimitModule } from '../rate-limit/rate-limit.module';
import { ModerationModule } from '../moderation/moderation.module';
@Module({ imports: [BlocksModule, VoiceSessionsModule, RateLimitModule, ModerationModule], providers: [MatchingService], exports: [MatchingService] })
export class MatchingModule {}
