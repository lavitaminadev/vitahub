import { IsOptional, IsString } from 'class-validator';

export class UpdateLeadDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() fitStatus?: string;
  @IsOptional() @IsString() discardReason?: string;
  @IsOptional() @IsString() notes?: string;
}
