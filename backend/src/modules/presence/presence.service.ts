import { Injectable } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class PresenceService {
  constructor(private readonly redis: RedisService) {}
  async markOnline(userId: string, socketId: string) {
    await this.redis.client.set(`presence:user:${userId}`, socketId, 'EX', 60 * 60 * 24);
    await this.redis.client.set(`presence:socket:${socketId}`, userId, 'EX', 60 * 60 * 24);
  }
  async refresh(userId: string, socketId: string) { await this.markOnline(userId, socketId); }
  async markOfflineBySocket(socketId: string) {
    const userId = await this.redis.client.get(`presence:socket:${socketId}`);
    if (userId) await this.redis.client.del(`presence:user:${userId}`);
    await this.redis.client.del(`presence:socket:${socketId}`);
    return userId;
  }
  async socketForUser(userId: string) { return this.redis.client.get(`presence:user:${userId}`); }
  async userForSocket(socketId: string) { return this.redis.client.get(`presence:socket:${socketId}`); }
}
