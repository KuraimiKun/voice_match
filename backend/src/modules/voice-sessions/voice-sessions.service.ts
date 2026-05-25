import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { VoiceSessionStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

const TERMINAL_STATUSES: VoiceSessionStatus[] = ['ENDED', 'SKIPPED', 'DISCONNECTED', 'BLOCKED'];

@Injectable()
export class VoiceSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userAId: string, userBId: string) {
    return this.prisma.voiceSession.create({
      data: { userAId, userBId, status: 'SIGNALING', startedAt: new Date() },
    });
  }

  async getAndAssertMember(sessionId: string, userId: string) {
    const session = await this.prisma.voiceSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('voice_session_not_found');
    if (session.userAId !== userId && session.userBId !== userId) throw new ForbiddenException('not_voice_session_member');
    return session;
  }

  async getActiveAndAssertMember(sessionId: string, userId: string) {
    const session = await this.getAndAssertMember(sessionId, userId);
    if (TERMINAL_STATUSES.includes(session.status)) throw new ForbiddenException('voice_session_not_active');
    return session;
  }

  partnerId(session: { userAId: string; userBId: string }, userId: string) {
    return session.userAId === userId ? session.userBId : session.userAId;
  }

  async partnerForSession(sessionId: string, userId: string) {
    const session = await this.getAndAssertMember(sessionId, userId);
    return { session, partnerId: this.partnerId(session, userId) };
  }

  async activePartnerForSession(sessionId: string, userId: string) {
    const session = await this.getActiveAndAssertMember(sessionId, userId);
    return { session, partnerId: this.partnerId(session, userId) };
  }

  async markSignaling(sessionId: string, userId: string) {
    const session = await this.getActiveAndAssertMember(sessionId, userId);
    if (session.status === 'CREATED') {
      return this.prisma.voiceSession.update({ where: { id: sessionId }, data: { status: 'SIGNALING' } });
    }
    return session;
  }

  async end(sessionId: string, endedById: string, status: VoiceSessionStatus, reason: string) {
    const session = await this.getAndAssertMember(sessionId, endedById);
    if (TERMINAL_STATUSES.includes(session.status)) return session;
    return this.prisma.voiceSession.update({
      where: { id: sessionId },
      data: { status, endReason: reason, endedById, endedAt: new Date() },
    });
  }
}
