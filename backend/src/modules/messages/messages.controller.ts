import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/http/current-user.decorator';
import { JwtAuthGuard } from '../../common/http/jwt-auth.guard';
import { MessagesService } from './messages.service';
@UseGuards(JwtAuthGuard)
@Controller('chat-rooms/:roomId/messages')
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}
  @Get() list(@CurrentUser() user: CurrentUser, @Param('roomId') roomId: string, @Query('before') before?: string) { return this.messages.history(user.userId, roomId, before); }
}
