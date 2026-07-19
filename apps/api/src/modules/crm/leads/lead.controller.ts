import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateLeadUseCase } from './use-cases/create-lead.use-case';
import { ListLeadsUseCase } from './use-cases/list-leads.use-case';
import { ConvertLeadUseCase } from './use-cases/convert-lead.use-case';
import { UpdateLeadUseCase } from './use-cases/update-lead.use-case';
import { GetLeadUseCase } from './use-cases/get-lead.use-case';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { Roles } from '../../../core/authorization/roles.decorator';
import { UserRole } from '../../organizations/user-role.enum';
import type { AuthenticatedRequest } from '@shared/types/request';

@ApiTags('CRM - Leads')
@Controller('crm/leads')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class LeadController {
  constructor(
    private createLead: CreateLeadUseCase,
    private listLeads: ListLeadsUseCase,
    private getLead: GetLeadUseCase,
    private convertLead: ConvertLeadUseCase,
    private updateLead: UpdateLeadUseCase,
  ) {}

  @Post()
  @Roles(UserRole.COMMERCIAL_DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo lead' })
  create(@Body() dto: CreateLeadDto, @Req() req: AuthenticatedRequest) {
    return this.createLead.execute({ ...dto, organizationId: req.organizationId });
  }

  @Get()
  @ApiOperation({ summary: 'Listar leads' })
  list(@Query('status') status: string, @Query('fitStatus') fitStatus: string, @Req() req: AuthenticatedRequest) {
    return this.listLeads.execute(req.organizationId, status, fitStatus);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un lead' })
  getById(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.getLead.execute(id, req.organizationId);
  }

  @Put(':id')
  @Roles(UserRole.COMMERCIAL_DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar estado de un lead' })
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto, @Req() req: AuthenticatedRequest) {
    return this.updateLead.execute(id, dto, req.organizationId);
  }

  @Post(':id/convert')
  @Roles(UserRole.COMMERCIAL_DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Convertir lead a cliente' })
  convert(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.convertLead.execute(id, req.organizationId);
  }
}
