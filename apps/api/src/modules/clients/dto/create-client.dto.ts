import { IsString, IsOptional, IsUUID, IsNumber, MaxLength } from 'class-validator';

export class CreateClientDto {
  @IsString() @MaxLength(255) name: string;
  @IsOptional() @IsString() @MaxLength(255) legalName?: string;
  @IsOptional() @IsString() @MaxLength(255) industry?: string;
  @IsOptional() @IsUUID() communityManagerId?: string;
  @IsOptional() @IsUUID() leadId?: string;
  @IsOptional() @IsNumber() retainerAmount?: number;
  @IsOptional() @IsString() @MaxLength(3) currency?: string;
  @IsOptional() @IsNumber() defaultUdBudget?: number;
}
