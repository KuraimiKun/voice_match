import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/http/current-user.decorator';
import { JwtAuthGuard } from '../../common/http/jwt-auth.guard';
import { BlockUserDto } from './dto/block.dto';
import { BlocksService } from './blocks.service';
@UseGuards(JwtAuthGuard)
@Controller('blocks')
export class BlocksController {
  constructor(private readonly blocks: BlocksService) {}
  @Post() create(@CurrentUser() user: CurrentUser, @Body() dto: BlockUserDto) { return this.blocks.blockUser(user.userId, dto.targetUserId, dto.reason); }
  @Get() list(@CurrentUser() user: CurrentUser) { return this.blocks.list(user.userId); }
}
