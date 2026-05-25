import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService, private readonly redis: RedisService) {}

  @Get()
  async health() {
    await this.prisma.$queryRaw`SELECT 1`;
    await this.redis.client.ping();
    return {
      ok: true,
      service: 'random-voice-social-backend',
      checks: {
        api: 'healthy',
        database: 'healthy',
        redis: 'healthy',
      },
      time: new Date().toISOString(),
    };
  }
}
