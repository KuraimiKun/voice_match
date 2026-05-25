import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { RateLimitModule } from '../rate-limit/rate-limit.module';

@Module({ imports: [JwtModule.register({}), RateLimitModule], controllers: [AuthController], providers: [AuthService], exports: [AuthService, JwtModule] })
export class AuthModule {}
