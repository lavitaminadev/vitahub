import { IsOptional, IsString, IsUUID, IsDateString, MaxLength } from 'class-validator';

export class AddContentItemDto {
  @IsUUID() gridId: string;
  @IsString() @MaxLength(255) title: string;
  @IsOptional() @IsString() @MaxLength(50) type?: string;
  @IsOptional() @IsDateString() scheduledDate?: string;
  @IsOptional() @IsString() @MaxLength(20) status?: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
}
