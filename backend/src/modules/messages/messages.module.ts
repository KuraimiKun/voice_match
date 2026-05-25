import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { ChatRoomsModule } from '../chat-rooms/chat-rooms.module';
import { RateLimitModule } from '../rate-limit/rate-limit.module';
import { JwtAuthGuard } from '../../common/http/jwt-auth.guard';
@Module({ imports: [JwtModule.register({}), ChatRoomsModule, RateLimitModule], controllers: [MessagesController], providers: [MessagesService, JwtAuthGuard], exports: [MessagesService] })
export class MessagesModule {}
