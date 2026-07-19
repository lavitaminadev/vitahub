import { Controller, Post, Get, Param, Body, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { MetaPixelService } from './meta-pixel.service';
import { MetaConversionsService } from './meta-conversions.service';
import { MetaOAuthService } from './meta-oauth.service';
import { MetaLeadAdsService } from './meta-lead-ads.service';
import { Roles } from '../../../core/authorization/roles.decorator';
import { UserRole } from '../../organizations/user-role.enum';
import type { AuthenticatedRequest } from '../../../shared/types/request';
import { toIntegrationResponse } from '../integration-response';
import { MetaAssetSelectionDto, MetaLeadSyncDto, MetaOAuthCallbackDto, MetaPixelDto } from './dto/meta-integration.dto';
import { createOAuthState, verifyOAuthState } from '../../../shared/security/oauth-state';

@Controller('integrations/meta')
@UseGuards(AuthGuard('jwt'))
export class MetaPixelController {
  constructor(
    private pixel: MetaPixelService,
    private conversions: MetaConversionsService,
    private oauth: MetaOAuthService,
    private metaLeadAds: MetaLeadAdsService,
  ) {}

  @Get('auth-url')
  @ApiOperation({ summary: 'Get Meta OAuth authorization URL' })
  @Roles(UserRole.ADMIN)
  getAuthUrl(@Req() req: AuthenticatedRequest, @Query('redirect_uri') redirectUri?: string) {
    const uri = redirectUri || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/integrations/meta/callback`;
    const state = createOAuthState('meta', req.organizationId, uri);
    return { url: this.oauth.getAuthorizationUrl(uri, state) };
  }

  @Get('status')
  @ApiOperation({ summary: 'Check Meta integration configuration status' })
  @Roles(UserRole.ADMIN)
  getStatus() {
    return {
      configured: this.oauth.isConfigured(),
      appId: this.oauth.getAppId() || null,
    };
  }

  @Post('callback')
  @ApiOperation({ summary: 'Handle Meta OAuth callback' })
  @Roles(UserRole.ADMIN)
  handleCallback(
    @Body() dto: MetaOAuthCallbackDto,
    @Req() req: AuthenticatedRequest,
  ) {
    verifyOAuthState(dto.state, { provider: 'meta', organizationId: req.organizationId, redirectUri: dto.redirectUri });
    return this.oauth.connectWithCode(req.organizationId, dto.code, dto.redirectUri).then(toIntegrationResponse);
  }

  @Post(':id/refresh')
  @ApiOperation({ summary: 'Refresh Meta access token' })
  @Roles(UserRole.ADMIN)
  refresh(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.oauth.refreshIntegration(id, req.organizationId).then(toIntegrationResponse);
  }

  @Get(':id/assets')
  @ApiOperation({ summary: 'Discover available Meta assets and current selection' })
  @Roles(UserRole.ADMIN)
  assets(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.oauth.discoverAssets(id, req.organizationId);
  }

  @Post(':id/assets')
  @ApiOperation({ summary: 'Persist selected Meta assets' })
  @Roles(UserRole.ADMIN)
  saveAssets(@Param('id') id: string, @Body() dto: MetaAssetSelectionDto, @Req() req: AuthenticatedRequest) {
    return this.oauth.saveSelectedAssets(id, req.organizationId, dto);
  }

  @Get(':id/health')
  @ApiOperation({ summary: 'Get Meta integration health' })
  @Roles(UserRole.ADMIN)
  health(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.oauth.getIntegrationHealth(id, req.organizationId);
  }

  @Post('leads/sync')
  @ApiOperation({ summary: 'Manually sync a Meta lead by page and leadgen id' })
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 12, ttl: 60000 } })
  syncLead(@Body() dto: MetaLeadSyncDto, @Req() req: AuthenticatedRequest) {
    const pageId = dto.pageId?.trim();
    const leadgenId = dto.leadgenId?.trim();
    if (!pageId || !leadgenId) {
      throw new BadRequestException('pageId and leadgenId are required');
    }
    return this.metaLeadAds.syncSingleLead(pageId, leadgenId, req.organizationId);
  }

  @Post(':id/pixel/validate')
  @Roles(UserRole.ADMIN)
  async validate(
    @Param('id') id: string,
    @Body() dto: MetaPixelDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const accessToken = await this.oauth.getSecureAccessToken(id, req.organizationId);
    const valid = await this.pixel.validatePixel(dto.pixelId, accessToken);
    if (valid) await this.oauth.savePixelId(id, req.organizationId, dto.pixelId);
    return { valid };
  }

  @Post(':id/conversions/test')
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async sendConversionTest(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const pixelId = await this.oauth.getPixelId(id, req.organizationId);
    if (!pixelId) throw new BadRequestException('Validate a Meta pixel before sending a test event');
    if (!process.env.META_TEST_EVENT_CODE) throw new BadRequestException('META_TEST_EVENT_CODE is required for test events');
    const accessToken = process.env.META_CONVERSIONS_ACCESS_TOKEN
      || await this.oauth.getSecureAccessToken(id, req.organizationId);
    return this.conversions.sendServerEvent(pixelId, accessToken, {
      eventName: 'Lead',
      eventTime: Math.floor(Date.now() / 1000),
      actionSource: 'system_generated',
      userData: { externalId: [`vitahub-test-${id}`] },
      eventId: `vitahub-test-${Date.now()}`,
    });
  }
}
