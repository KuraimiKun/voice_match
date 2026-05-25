import { ReportReason } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class SocketAuthenticatePayloadDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class VoiceSessionPayloadDto {
  @IsUUID()
  voiceSessionId!: string;
}

export class SignalingPayloadDto extends VoiceSessionPayloadDto {
  @IsObject()
  payload!: Record<string, unknown>;
}

export class JoinChatRoomPayloadDto {
  @IsUUID()
  roomId!: string;
}

export class SendChatMessagePayloadDto extends JoinChatRoomPayloadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  body!: string;
}

export class FriendAddCurrentPartnerPayloadDto extends VoiceSessionPayloadDto {}

export class ReportUserPayloadDto {
  @IsOptional()
  @IsUUID()
  voiceSessionId?: string;

  @IsOptional()
  @IsUUID()
  reportedUserId?: string;

  @IsOptional()
  @IsEnum(ReportReason)
  reason?: ReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  details?: string;
}

export class ReportMessagePayloadDto {
  @IsUUID()
  messageId!: string;

  @IsOptional()
  @IsEnum(ReportReason)
  reason?: ReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  details?: string;
}

export class BlockUserPayloadDto {
  @IsOptional()
  @IsUUID()
  targetUserId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @IsOptional()
  @IsUUID()
  voiceSessionId?: string;
}
