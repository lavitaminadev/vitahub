import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateLeadUseCase } from './use-cases/create-lead.use-case';
import { ListLeadsUseCase } from './use-cases/list-leads.use-case';
import { ConvertLeadUseCase } from './use-cases/convert-lead.use-case';

@ApiTags('CRM - Leads')
@Controller('crm/leads')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class LeadController {
  constructor(
    private createLead: CreateLeadUseCase,
    private listLeads: ListLeadsUseCase,
    private convertLead: ConvertLeadUseCase,
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

  @Post(':id/convert')
  @ApiOperation({ summary: 'Convertir lead a cliente' })
  convert(@Param('id') id: string, @Req() req: any) {
    return this.convertLead.execute(id, req.organizationId);
  }
}
