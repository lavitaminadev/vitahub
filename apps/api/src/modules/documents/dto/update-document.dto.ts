import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDocumentDto {
  @IsOptional() @IsString() @MaxLength(255) name?: string;
  @IsOptional() @IsString() @MaxLength(50) type?: string;
  @IsOptional() @IsString() @MaxLength(500) fileUrl?: string;
  @IsOptional() @IsString() @MaxLength(255) driveFileId?: string;
  @IsOptional() @IsString() @MaxLength(20) status?: string;
  @IsOptional() tags?: string[];
}
