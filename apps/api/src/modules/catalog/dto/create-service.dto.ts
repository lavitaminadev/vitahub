import { IsString, IsOptional, IsNumber, IsEnum, MaxLength } from 'class-validator';
import { ServiceCategory } from '../service-category.enum';

export class CreateServiceDto {
  @IsString() @MaxLength(255) name: string;
  @IsEnum(ServiceCategory) category: ServiceCategory;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() unitPrice?: number;
  @IsOptional() @IsString() @MaxLength(3) currency?: string;
  @IsOptional() @IsNumber() udPerUnit?: number;
}
