import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class RateLimitService {
  constructor(private readonly redis: RedisService) {}
  async assertWithinLimit(key: string, max: number, windowSeconds: number) {
    const redisKey = `rl:${key}`;
    const count = await this.redis.client.incr(redisKey);
    if (count === 1) await this.redis.client.expire(redisKey, windowSeconds);
    if (count > max) throw new HttpException('rate_limit_exceeded', HttpStatus.TOO_MANY_REQUESTS);
  }
}
