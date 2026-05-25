import { Body, Controller, Post } from '@nestjs/common';
import { AnonymousAuthDto } from './dto/anonymous-auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('anonymous')
  createAnonymous(@Body() dto: AnonymousAuthDto) { return this.auth.createOrLoadAnonymous(dto); }
}
