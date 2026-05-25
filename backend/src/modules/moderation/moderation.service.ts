import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService) {}
  activeBanForUser(userId: string) { return this.prisma.userBan.findFirst({ where: { userId, revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] } }); }
}
