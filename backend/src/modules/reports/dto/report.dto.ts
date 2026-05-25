import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ReportReason, ReportType } from '@prisma/client';
export class CreateReportDto {
  @IsEnum(ReportType) type!: ReportType;
  @IsEnum(ReportReason) reason!: ReportReason;
  @IsOptional() @IsUUID() reportedUserId?: string;
  @IsOptional() @IsUUID() voiceSessionId?: string;
  @IsOptional() @IsUUID() messageId?: string;
  @IsOptional() @IsUUID() chatRoomId?: string;
  @IsOptional() @IsString() @MaxLength(2000) details?: string;
}
