import { IsEmail, IsString, MinLength, IsOptional, IsUUID } from 'class-validator';

/**
 * Registration request body.
 */
export class RegisterDto {
  /** New user's email. */
  @IsEmail()
  email: string;

  /** Plain-text password (min 6 characters). */
  @IsString()
  @MinLength(6)
  password: string;

  /** Display name. */
  @IsString()
  @MinLength(2)
  name: string;

  /** Optional existing organization id. */
  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
