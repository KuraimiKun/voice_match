import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { BlocksService } from '../blocks/blocks.service';

@Injectable()
export class ChatRoomsService {
  constructor(private readonly prisma: PrismaService, private readonly blocks: BlocksService) {}
  async createForFriendship(friendshipId: string) {
    return this.prisma.chatRoom.upsert({ where: { friendshipId }, update: {}, create: { friendshipId } });
  }
  async listForUser(userId: string) {
    const rooms = await this.prisma.chatRoom.findMany({
      where: { deletedAt: null, friendship: { deletedAt: null, OR: [{ userAId: userId }, { userBId: userId }] } },
      include: { friendship: true, messages: { take: 1, orderBy: { createdAt: 'desc' } } },
      orderBy: { updatedAt: 'desc' },
    });
    return { rooms: rooms.map((r) => ({ id: r.id, friendshipId: r.friendshipId, peerUserId: r.friendship.userAId === userId ? r.friendship.userBId : r.friendship.userAId, lastMessage: r.messages[0] ?? null, updatedAt: r.updatedAt })) };
  }
  async assertMember(roomId: string, userId: string) {
    const room = await this.prisma.chatRoom.findFirst({ where: { id: roomId, deletedAt: null }, include: { friendship: true } });
    if (!room) throw new NotFoundException('chat_room_not_found');
    const member = room.friendship.userAId === userId || room.friendship.userBId === userId;
    if (!member || room.friendship.deletedAt) throw new ForbiddenException('not_chat_room_member');
    const peerId = room.friendship.userAId === userId ? room.friendship.userBId : room.friendship.userAId;
    if (await this.blocks.isEitherBlocked(userId, peerId)) throw new ForbiddenException('chat_blocked');
    return { room, peerId };
  }
}
