import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateContactDto {
  @IsOptional() @IsString() @MaxLength(255) name?: string;
  @IsOptional() @IsString() leadId?: string;
  @IsOptional() @IsString() @MaxLength(255) email?: string;
  @IsOptional() @IsString() @MaxLength(50) phone?: string;
  @IsOptional() @IsString() @MaxLength(255) position?: string;
  @IsOptional() @IsString() notes?: string;
}
