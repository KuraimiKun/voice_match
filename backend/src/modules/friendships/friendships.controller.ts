import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/http/current-user.decorator';
import { JwtAuthGuard } from '../../common/http/jwt-auth.guard';
import { FriendshipsService } from './friendships.service';

@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendshipsController {
  constructor(private readonly friendships: FriendshipsService) {}
  @Get()
  list(@CurrentUser() user: CurrentUser) { return this.friendships.listForUser(user.userId); }
}
