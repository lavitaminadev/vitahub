import { IsString, IsOptional, IsUUID, IsInt, Min, Max, MaxLength } from 'class-validator';

export class CreatePieceDto {
  @IsUUID() clientId: string;
  @IsString() @MaxLength(255) title: string;
  @IsString() @MaxLength(50) type: string;
  @IsOptional() @IsInt() @Min(1) @Max(5) difficultyLevel?: number;
  @IsOptional() @IsString() @MaxLength(20) status?: string;
}
