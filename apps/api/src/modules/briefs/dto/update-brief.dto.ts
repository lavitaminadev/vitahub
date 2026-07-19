import { IsOptional, IsString, IsDateString, MaxLength } from 'class-validator';

export class UpdateBriefDto {
  @IsOptional() @IsString() @MaxLength(255) title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() requirements?: Record<string, any>;
  @IsOptional() @IsString() @MaxLength(20) status?: string;
  @IsOptional() @IsDateString() dueDate?: string;
}
