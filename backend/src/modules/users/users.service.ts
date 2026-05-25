import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, anonymousHandle: true, createdAt: true, rulesAcceptedAt: true, ageGatePassedAt: true } });
    if (!user) throw new NotFoundException('user_not_found');
    return { user };
  }
}
