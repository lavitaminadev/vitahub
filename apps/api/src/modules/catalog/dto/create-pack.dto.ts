import { IsString, IsOptional, IsNumber, MaxLength } from 'class-validator';

export class CreatePackDto {
  @IsString() @MaxLength(255) name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() monthlyUd?: number;
  @IsOptional() @IsNumber() reelsIncluded?: number;
  @IsOptional() @IsNumber() monthlyPrice?: number;
  @IsOptional() @IsString() @MaxLength(3) currency?: string;
  @IsOptional() @IsString() services?: string;
}
