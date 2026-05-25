import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { RateLimitModule } from '../rate-limit/rate-limit.module';
import { JwtAuthGuard } from '../../common/http/jwt-auth.guard';
@Module({ imports: [JwtModule.register({}), RateLimitModule], controllers: [ReportsController], providers: [ReportsService, JwtAuthGuard], exports: [ReportsService] })
export class ReportsModule {}
