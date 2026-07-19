import { IsOptional, IsString, IsDateString, IsArray, MaxLength } from 'class-validator';

export class UpdateSessionDto {
  @IsOptional() @IsString() @MaxLength(50) type?: string;
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsString() @MaxLength(255) location?: string;
  @IsOptional() @IsArray() assignedTeam?: string[];
  @IsOptional() @IsString() moodboardId?: string;
  @IsOptional() @IsString() @MaxLength(20) status?: string;
}
