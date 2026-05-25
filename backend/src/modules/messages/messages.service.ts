import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { sanitizeText } from '../../common/utils/sanitize';
import { ChatRoomsService } from '../chat-rooms/chat-rooms.service';
import { RateLimitService } from '../rate-limit/rate-limit.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService, private readonly rooms: ChatRoomsService, private readonly rates: RateLimitService, private readonly config: ConfigService) {}
  async history(userId: string, roomId: string, before?: string) {
    await this.rooms.assertMember(roomId, userId);
    const messages = await this.prisma.message.findMany({ where: { roomId, status: 'SENT', deletedAt: null, ...(before ? { createdAt: { lt: new Date(before) } } : {}) }, orderBy: { createdAt: 'desc' }, take: 50 });
    return { messages: messages.reverse() };
  }
  async send(userId: string, roomId: string, body: string) {
    await this.rates.assertWithinLimit(`msg:${userId}`, Number(this.config.get('MESSAGE_MAX_PER_WINDOW') ?? 8), Number(this.config.get('MESSAGE_WINDOW_SECONDS') ?? 10));
    await this.rooms.assertMember(roomId, userId);
    const clean = sanitizeText(body);
    const max = Number(this.config.get('MESSAGE_MAX_LENGTH') ?? 1000);
    if (!clean) throw new BadRequestException('empty_message');
    if (clean.length > max) throw new BadRequestException('message_too_long');
    const message = await this.prisma.message.create({ data: { roomId, senderId: userId, body: clean } });
    await this.prisma.chatRoom.update({ where: { id: roomId }, data: { updatedAt: new Date() } });
    return { message };
  }
}
