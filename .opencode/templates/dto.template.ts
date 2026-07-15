import { IsString, IsOptional, IsUUID } from 'class-validator';

export class Create{{Entity}}Dto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
