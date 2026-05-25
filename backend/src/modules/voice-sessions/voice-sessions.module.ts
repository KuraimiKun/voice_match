import { Module } from '@nestjs/common';
import { VoiceSessionsService } from './voice-sessions.service';
@Module({ providers: [VoiceSessionsService], exports: [VoiceSessionsService] })
export class VoiceSessionsModule {}
