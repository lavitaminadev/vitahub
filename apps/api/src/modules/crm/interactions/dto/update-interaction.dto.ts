import { IsOptional, IsString, IsDateString, MaxLength } from 'class-validator';

export class UpdateInteractionDto {
  @IsOptional() @IsString() @MaxLength(50) type?: string;
  @IsOptional() @IsString() leadId?: string;
  @IsOptional() @IsString() contactId?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsString() createdBy?: string;
}
