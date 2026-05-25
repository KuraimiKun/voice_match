import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '../../common/http/jwt-auth.guard';
import { RateLimitModule } from '../rate-limit/rate-limit.module';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';

@Module({
  imports: [JwtModule.register({}), RateLimitModule],
  controllers: [BlocksController],
  providers: [BlocksService, JwtAuthGuard],
  exports: [BlocksService],
})
export class BlocksModule {}
