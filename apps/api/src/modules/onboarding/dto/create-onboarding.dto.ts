import { IsUUID, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateOnboardingDto {
  @IsUUID() clientId: string;
  @IsString() @MaxLength(255) step: string;
  @IsOptional() @IsString() @MaxLength(20) status?: string;
  @IsOptional() @IsUUID() assignedTo?: string;
  @IsOptional() @IsString() notes?: string;
}
