import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BlocksService {
  constructor(private readonly prisma: PrismaService) {}
  async blockUser(blockerId: string, blockedId: string, reason?: string) {
    if (blockerId === blockedId) throw new BadRequestException('cannot_block_self');
    const block = await this.prisma.block.upsert({ where: { blockerId_blockedId: { blockerId, blockedId } }, update: { reason }, create: { blockerId, blockedId, reason } });
    return { block };
  }
  async isEitherBlocked(a: string, b: string) {
    const block = await this.prisma.block.findFirst({ where: { OR: [{ blockerId: a, blockedId: b }, { blockerId: b, blockedId: a }] }, select: { id: true } });
    return Boolean(block);
  }
  async list(userId: string) {
    const blocks = await this.prisma.block.findMany({ where: { blockerId: userId }, orderBy: { createdAt: 'desc' } });
    return { blocks };
  }
}
