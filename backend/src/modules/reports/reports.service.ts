import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RateLimitService } from '../rate-limit/rate-limit.service';
import { CreateReportDto } from './dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService, private readonly rates: RateLimitService, private readonly config: ConfigService) {}
  async create(reporterId: string, dto: CreateReportDto) {
    await this.rates.assertWithinLimit(`report:${reporterId}`, Number(this.config.get('REPORT_MAX_PER_WINDOW') ?? 5), Number(this.config.get('REPORT_WINDOW_SECONDS') ?? 60));
    const report = await this.prisma.report.create({ data: { reporterId, ...dto } });
    return { report };
  }
}
