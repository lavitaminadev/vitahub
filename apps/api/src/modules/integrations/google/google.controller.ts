import { Controller, Get, Post, Body, Query, UseGuards, Req, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GoogleOAuthService } from './google-oauth.service';
import { Roles } from '../../../core/authorization/roles.decorator';
import { UserRole } from '../../organizations/user-role.enum';
import type { AuthenticatedRequest } from '../../../shared/types/request';
import { GoogleOAuthCallbackDto } from './dto/google-oauth-callback.dto';
import { createOAuthState, verifyOAuthState } from '../../../shared/security/oauth-state';
import { toIntegrationResponse } from '../integration-response';

@ApiTags('Google Integrations')
@Controller('integrations/google')
@UseGuards(AuthGuard('jwt'))
export class GoogleController {
  constructor(private readonly oauth: GoogleOAuthService) {}

  @Get('auth-url')
  @ApiOperation({ summary: 'Get Google OAuth authorization URL' })
  @Roles(UserRole.ADMIN)
  getAuthUrl(@Req() req: AuthenticatedRequest, @Query('redirect_uri') redirectUri?: string) {
    const uri = redirectUri || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/integrations/google/callback`;
    const state = createOAuthState('google', req.organizationId, uri);
    return { url: this.oauth.getAuthorizationUrl(uri, state) };
  }

  @Get('status')
  @ApiOperation({ summary: 'Check Google integration configuration status' })
  @Roles(UserRole.ADMIN)
  getStatus() {
    return {
      configured: this.oauth.isConfigured(),
      clientId: this.oauth.getClientId() || null,
    };
  }

  @Post('callback')
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @Roles(UserRole.ADMIN)
  handleCallback(
    @Body() body: GoogleOAuthCallbackDto,
    @Req() req: AuthenticatedRequest,
  ) {
    verifyOAuthState(body.state, { provider: 'google', organizationId: req.organizationId, redirectUri: body.redirectUri });
    return this.oauth.connectWithCode(req.organizationId, body.code, body.redirectUri).then(toIntegrationResponse);
  }

  @Post(':id/refresh')
  @ApiOperation({ summary: 'Refresh Google OAuth access token' })
  @Roles(UserRole.ADMIN)
  refresh(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.oauth.refreshIntegration(id, req.organizationId).then(toIntegrationResponse);
  }
}
