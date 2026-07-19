import { IsOptional, IsString, IsNumber, IsDateString, MaxLength } from 'class-validator';

export class UpdateOpportunityDto {
  @IsOptional() @IsString() @MaxLength(255) name?: string;
  @IsOptional() @IsString() leadId?: string;
  @IsOptional() @IsString() clientId?: string;
  @IsOptional() @IsNumber() amount?: number;
  @IsOptional() @IsString() @MaxLength(50) stage?: string;
  @IsOptional() @IsNumber() probability?: number;
  @IsOptional() @IsDateString() expectedCloseDate?: string;
  @IsOptional() @IsString() assignedTo?: string;
}
