import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FriendshipsService } from './friendships.service';
import { FriendshipsController } from './friendships.controller';
import { VoiceSessionsModule } from '../voice-sessions/voice-sessions.module';
import { ChatRoomsModule } from '../chat-rooms/chat-rooms.module';
import { BlocksModule } from '../blocks/blocks.module';
import { JwtAuthGuard } from '../../common/http/jwt-auth.guard';
@Module({ imports: [JwtModule.register({}), VoiceSessionsModule, ChatRoomsModule, BlocksModule], controllers: [FriendshipsController], providers: [FriendshipsService, JwtAuthGuard], exports: [FriendshipsService] })
export class FriendshipsModule {}
