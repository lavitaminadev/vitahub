import { IsString } from 'class-validator';

/**
 * Refresh token request body.
 */
export class RefreshDto {
  /** Valid refresh token. */
  @IsString()
  refreshToken: string;
}
