import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatRoomsController } from './chat-rooms.controller';
import { ChatRoomsService } from './chat-rooms.service';
import { BlocksModule } from '../blocks/blocks.module';
import { JwtAuthGuard } from '../../common/http/jwt-auth.guard';
@Module({ imports: [JwtModule.register({}), BlocksModule], controllers: [ChatRoomsController], providers: [ChatRoomsService, JwtAuthGuard], exports: [ChatRoomsService] })
export class ChatRoomsModule {}
