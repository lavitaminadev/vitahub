import { IsOptional, IsString, IsArray, MaxLength } from 'class-validator';

export class UpdateMoodboardDto {
  @IsOptional() @IsString() @MaxLength(255) title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() images?: string[];
  @IsOptional() @IsString() verifiedBy?: string;
  @IsOptional() @IsString() @MaxLength(20) status?: string;
}
