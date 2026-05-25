import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RateLimitService } from '../rate-limit/rate-limit.service';
import { AnonymousAuthDto } from './dto/anonymous-auth.dto';

const HANDLE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function handleId(): string {
  let value = '';
  for (let i = 0; i < 10; i += 1) {
    value += HANDLE_ALPHABET[randomInt(HANDLE_ALPHABET.length)];
  }
  return value;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly rates: RateLimitService,
  ) {}

  async createOrLoadAnonymous(dto: AnonymousAuthDto) {
    await this.rates.assertWithinLimit(
      `auth:${dto.installationId}`,
      Number(this.config.get('AUTH_MAX_PER_WINDOW') ?? 30),
      Number(this.config.get('AUTH_WINDOW_SECONDS') ?? 60),
    );
    const session = await this.prisma.deviceSession.upsert({
      where: { installationId: dto.installationId },
      update: { lastSeenAt: new Date(), platform: dto.platform ?? 'UNKNOWN', appVersion: dto.appVersion },
      create: {
        installationId: dto.installationId,
        platform: dto.platform ?? 'UNKNOWN',
        appVersion: dto.appVersion,
        user: { create: { anonymousHandle: `anon_${handleId()}` } },
      },
      include: { user: true },
    });
    const token = await this.jwt.signAsync(
      { sub: session.userId, sid: session.id },
      {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN') ?? '30d',
      },
    );
    return { token, user: { id: session.user.id, anonymousHandle: session.user.anonymousHandle }, deviceSessionId: session.id };
  }

  async verifySocketToken(token: string) {
    const payload = await this.jwt.verifyAsync<{ sub: string }>(token, { secret: this.config.get<string>('JWT_SECRET') });
    const user = await this.prisma.user.findFirst({ where: { id: payload.sub, status: 'ACTIVE', deletedAt: null } });
    if (!user) throw new Error('user_not_active');
    return { userId: user.id };
  }
}
