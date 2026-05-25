import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/http/current-user.decorator';
import { JwtAuthGuard } from '../../common/http/jwt-auth.guard';
import { CreateReportDto } from './dto/report.dto';
import { ReportsService } from './reports.service';
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}
  @Post() create(@CurrentUser() user: CurrentUser, @Body() dto: CreateReportDto) { return this.reports.create(user.userId, dto); }
}
