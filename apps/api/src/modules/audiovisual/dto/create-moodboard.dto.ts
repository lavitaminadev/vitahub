import { IsString, IsOptional, IsArray, MaxLength } from 'class-validator';

export class CreateMoodboardDto {
  @IsString() @MaxLength(255) title: string;
  @IsString() clientId: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() images?: string[];
  @IsOptional() @IsString() createdBy?: string;
  @IsOptional() @IsString() verifiedBy?: string;
  @IsOptional() @IsString() @MaxLength(20) status?: string;
}
