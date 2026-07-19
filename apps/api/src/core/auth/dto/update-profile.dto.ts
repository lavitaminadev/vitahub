import { IsOptional, IsString, IsEmail, MaxLength } from 'class-validator';

/**
 * Profile update request body.
 */
export class UpdateProfileDto {
  /** New display name. */
  @IsOptional() @IsString() @MaxLength(255) name?: string;

  /** New email address. */
  @IsOptional() @IsEmail() email?: string;
}
