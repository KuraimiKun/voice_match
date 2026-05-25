import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../common/redis/redis.service';
import { BlocksService } from '../blocks/blocks.service';
import { VoiceSessionsService } from '../voice-sessions/voice-sessions.service';
import { RateLimitService } from '../rate-limit/rate-limit.service';
import { ModerationService } from '../moderation/moderation.service';

type QueuedUser = { userId: string; socketId: string; enqueuedAt: number };

@Injectable()
export class MatchingService {
  private readonly queueKey = 'matching:queue:v1';
  constructor(private readonly redis: RedisService, private readonly blocks: BlocksService, private readonly sessions: VoiceSessionsService, private readonly rates: RateLimitService, private readonly config: ConfigService, private readonly moderation: ModerationService) {}

  async joinQueue(userId: string, socketId: string) {
    await this.rates.assertWithinLimit(`queue:${userId}`, Number(this.config.get('QUEUE_MAX_PER_WINDOW') ?? 5), Number(this.config.get('QUEUE_WINDOW_SECONDS') ?? 10));
    if (await this.moderation.activeBanForUser(userId)) throw new ForbiddenException('user_banned');
    await this.stopSearching(userId);
    const current: QueuedUser = { userId, socketId, enqueuedAt: Date.now() };
    const candidate = await this.findCandidateFor(userId);
    if (!candidate) {
      await this.redis.client.lpush(this.queueKey, JSON.stringify(current));
      await this.redis.client.set(`matching:user:${userId}`, socketId, 'EX', 120);
      return { status: 'waiting' as const };
    }
    await this.redis.client.del(`matching:user:${userId}`, `matching:user:${candidate.userId}`);
    const session = await this.sessions.create(candidate.userId, userId);
    return { status: 'matched' as const, session, a: candidate, b: current };
  }

  async stopSearching(userId: string) { await this.redis.client.del(`matching:user:${userId}`); }

  private async findCandidateFor(userId: string): Promise<QueuedUser | null> {
    for (let i = 0; i < 50; i++) {
      const raw = await this.redis.client.rpop(this.queueKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as QueuedUser;
      const stillQueued = await this.redis.client.get(`matching:user:${parsed.userId}`);
      if (!stillQueued || parsed.userId === userId) continue;
      if (await this.moderation.activeBanForUser(parsed.userId)) continue;
      const blocked = await this.blocks.isEitherBlocked(userId, parsed.userId);
      if (blocked) continue;
      return parsed;
    }
    return null;
  }
}
