import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
export class SendMessageDto { @IsUUID() roomId!: string; @IsString() @MinLength(1) @MaxLength(1000) body!: string; }
