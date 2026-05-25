import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/http/current-user.decorator';
import { JwtAuthGuard } from '../../common/http/jwt-auth.guard';
import { ChatRoomsService } from './chat-rooms.service';
@UseGuards(JwtAuthGuard)
@Controller('chat-rooms')
export class ChatRoomsController {
  constructor(private readonly rooms: ChatRoomsService) {}
  @Get() list(@CurrentUser() user: CurrentUser) { return this.rooms.listForUser(user.userId); }
}
