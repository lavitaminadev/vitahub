import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateOnboardingDto {
  @IsOptional() @IsString() @MaxLength(255) step?: string;
  @IsOptional() @IsString() @MaxLength(20) status?: string;
  @IsOptional() @IsUUID() assignedTo?: string;
  @IsOptional() @IsString() notes?: string;
}
