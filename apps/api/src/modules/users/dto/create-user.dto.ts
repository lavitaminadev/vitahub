import { IsString, IsEmail, MinLength, MaxLength, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { UserRole } from '../../organizations/user-role.enum';

/**
 * DTO for creating a new user inside the caller organization.
 */
export class CreateUserDto {
  /** Display name. */
  @IsString() @MinLength(2) @MaxLength(255) name: string;

  /** Unique email address. */
  @IsEmail() email: string;

  /** Plain-text initial password. */
  @IsString() @MinLength(6) password: string;

  /** Optional phone number. */
  @IsOptional() @IsString() @MaxLength(20) phone?: string;

  /** Role assigned to the user. Defaults to designer. */
  @IsOptional() @IsEnum(UserRole) role?: UserRole;

  /** Linked client account when this is a portal/client user. */
  @IsOptional() @IsUUID() clientId?: string;
}
