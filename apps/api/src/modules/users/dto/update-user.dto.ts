import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../../organizations/user-role.enum';

export class UpdateUserDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(255) name?: string;

  @IsOptional() @IsEmail() email?: string;

  @IsOptional() @IsString() @MaxLength(20) phone?: string;

  @IsOptional() @IsEnum(UserRole) role?: UserRole;

  @IsOptional() @IsUUID() clientId?: string | null;

  @IsOptional() @IsBoolean() isActive?: boolean;
}
