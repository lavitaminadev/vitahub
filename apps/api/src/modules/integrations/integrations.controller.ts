import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateIntegrationUseCase } from './create-integration.use-case';
import { ListIntegrationsUseCase } from './list-integrations.use-case';
import { UpdateIntegrationUseCase } from './update-integration.use-case';

@ApiTags('Integraciones')
@Controller('integrations')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class IntegrationsController {
  constructor(
    private createIntegration: CreateIntegrationUseCase,
    private listIntegrations: ListIntegrationsUseCase,
    private updateIntegration: UpdateIntegrationUseCase,
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

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar estado de una integración' })
  update(@Param('id') id: string, @Body() dto: { status?: string; config?: Record<string, unknown> }, @Req() req: any) {
    return this.updateIntegration.execute(id, dto, req.organizationId);
  }
}
