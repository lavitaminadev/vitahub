import { IsString, IsOptional, IsUUID, IsNumber, IsDateString, MaxLength } from 'class-validator';

export class CreateContractDto {
  @IsUUID() clientId: string;
  @IsString() @MaxLength(255) name: string;
  @IsOptional() @IsString() @MaxLength(255) serviceType?: string;
  @IsDateString() startDate: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsNumber() monthlyUd?: number;
  @IsOptional() @IsString() @MaxLength(20) status?: string;
  @IsOptional() @IsString() terms?: string;
}
