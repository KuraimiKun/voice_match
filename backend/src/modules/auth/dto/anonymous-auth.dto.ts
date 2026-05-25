import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AnonymousAuthDto {
  @IsString() @MinLength(8) @MaxLength(128) installationId!: string;
  @IsOptional() @IsIn(['IOS', 'ANDROID', 'WEB', 'UNKNOWN']) platform?: 'IOS' | 'ANDROID' | 'WEB' | 'UNKNOWN';
  @IsOptional() @IsString() @MaxLength(32) appVersion?: string;
}
