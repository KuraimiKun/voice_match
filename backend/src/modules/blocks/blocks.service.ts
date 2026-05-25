import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RateLimitService } from '../rate-limit/rate-limit.service';

@Injectable()
export class BlocksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rates: RateLimitService,
    private readonly config: ConfigService,
  ) {}

  async blockUser(blockerId: string, blockedId: string, reason?: string) {
    await this.rates.assertWithinLimit(
      `block:${blockerId}`,
      Number(this.config.get('BLOCK_MAX_PER_WINDOW') ?? 20),
      Number(this.config.get('BLOCK_WINDOW_SECONDS') ?? 60),
    );
    if (blockerId === blockedId) throw new BadRequestException('cannot_block_self');
    const block = await this.prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId, blockedId } },
      update: { reason },
      create: { blockerId, blockedId, reason },
    });
    return { block };
  }

  async isEitherBlocked(a: string, b: string) {
    const block = await this.prisma.block.findFirst({
      where: { OR: [{ blockerId: a, blockedId: b }, { blockerId: b, blockedId: a }] },
      select: { id: true },
    });
    return Boolean(block);
  }

  async list(userId: string) {
    const blocks = await this.prisma.block.findMany({ where: { blockerId: userId }, orderBy: { createdAt: 'desc' } });
    return { blocks };
  }
}
