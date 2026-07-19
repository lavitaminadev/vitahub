import { IsString, IsOptional, IsDateString, IsArray, MaxLength } from 'class-validator';

export class CreateSessionDto {
  @IsString() @MaxLength(50) type: string;
  @IsString() clientId: string;
  @IsDateString() date: string;
  @IsOptional() @IsString() @MaxLength(255) location?: string;
  @IsOptional() @IsArray() assignedTeam?: string[];
  @IsOptional() @IsString() moodboardId?: string;
  @IsOptional() @IsString() @MaxLength(20) status?: string;
}
