import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
export class BlockUserDto { @IsUUID() targetUserId!: string; @IsOptional() @IsString() @MaxLength(500) reason?: string; }
