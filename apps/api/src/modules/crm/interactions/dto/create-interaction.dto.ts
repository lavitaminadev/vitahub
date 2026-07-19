import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateInteractionDto {
  @IsString() @MaxLength(50) type: string;
  @IsOptional() @IsString() leadId?: string;
  @IsOptional() @IsString() contactId?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsString() createdBy?: string;
}
