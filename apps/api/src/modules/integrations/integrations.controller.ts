import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateIntegrationUseCase } from './create-integration.use-case';
import { ListIntegrationsUseCase } from './list-integrations.use-case';

@ApiTags('Integraciones')
@Controller('integrations')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class IntegrationsController {
  constructor(
    private createIntegration: CreateIntegrationUseCase,
    private listIntegrations: ListIntegrationsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva integración' })
  create(@Body() dto: any, @Req() req: any) {
    return this.createIntegration.execute({ ...dto, organizationId: req.organizationId });
  }

  @Get()
  @ApiOperation({ summary: 'Listar integraciones' })
  list(@Query('provider') provider: string, @Req() req: any) {
    return this.listIntegrations.execute(req.organizationId, provider);
  }
}
