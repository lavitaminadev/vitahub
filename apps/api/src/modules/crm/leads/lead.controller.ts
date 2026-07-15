import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateLeadUseCase } from './use-cases/create-lead.use-case';
import { ListLeadsUseCase } from './use-cases/list-leads.use-case';
import { ConvertLeadUseCase } from './use-cases/convert-lead.use-case';
import { UpdateLeadUseCase } from './use-cases/update-lead.use-case';

@ApiTags('CRM - Leads')
@Controller('crm/leads')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class LeadController {
  constructor(
    private createLead: CreateLeadUseCase,
    private listLeads: ListLeadsUseCase,
    private convertLead: ConvertLeadUseCase,
    private updateLead: UpdateLeadUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo lead' })
  create(@Body() dto: any, @Req() req: any) {
    return this.createLead.execute({ ...dto, organizationId: req.organizationId });
  }

  @Get()
  @ApiOperation({ summary: 'Listar leads' })
  list(@Query('status') status: string, @Req() req: any) {
    return this.listLeads.execute(req.organizationId, status);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar estado de un lead' })
  update(@Param('id') id: string, @Body() dto: { status?: string; notes?: string }, @Req() req: any) {
    return this.updateLead.execute(id, dto, req.organizationId);
  }

  @Post(':id/convert')
  @ApiOperation({ summary: 'Convertir lead a cliente' })
  convert(@Param('id') id: string, @Req() req: any) {
    return this.convertLead.execute(id, req.organizationId);
  }
}
