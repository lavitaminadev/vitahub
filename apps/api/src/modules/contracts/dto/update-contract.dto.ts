import { IsOptional, IsString, IsNumber, IsDateString, MaxLength } from 'class-validator';

export class UpdateContractDto {
  @IsOptional() @IsString() @MaxLength(255) name?: string;
  @IsOptional() @IsString() @MaxLength(255) serviceType?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsNumber() monthlyUd?: number;
  @IsOptional() @IsString() @MaxLength(20) status?: string;
  @IsOptional() @IsString() terms?: string;
}
