import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';
import { JwtAuthGuard } from '../../common/http/jwt-auth.guard';
@Module({ imports: [JwtModule.register({})], controllers: [BlocksController], providers: [BlocksService, JwtAuthGuard], exports: [BlocksService] })
export class BlocksModule {}
