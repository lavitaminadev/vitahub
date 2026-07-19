import { Controller, Get, Delete, Post, Body, Req, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { DataProtectionService } from './data-protection.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../authorization/roles.decorator';
import { UserRole } from '../../modules/organizations/user-role.enum';

@ApiTags('Proteccion de Datos')
@Controller('data-protection')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DataProtectionController {
  constructor(private service: DataProtectionService) {}

  @Get('export')
  @ApiOperation({ summary: 'Exportar mis datos personales (Ley 19.628)' })
  async exportMyData(@CurrentUser() user: any) {
    return this.service.exportUserData(user.id);
  }

  @Delete('anonymize')
  @ApiOperation({ summary: 'Anonimizar mis datos personales' })
  async anonymizeMe(@CurrentUser() user: any) {
    await this.service.anonymizeUser(user.id);
    return { message: 'Datos anonimizados correctamente' };
  }

  @Post('consent')
  @ApiOperation({ summary: 'Registrar consentimiento de datos' })
  @ApiBody({ schema: { properties: { action: { type: 'string' }, granted: { type: 'boolean' } } } })
  async recordConsent(@CurrentUser() user: any, @Body() body: { action: string; granted: boolean }, @Req() req: any) {
    return this.service.recordConsent(user.id, body.action, body.granted, req.ip);
  }

  @Get('leads/:id/export')
  @Roles(UserRole.ADMIN, UserRole.COMMERCIAL_DIRECTOR)
  @ApiOperation({ summary: 'Exportar datos de un lead para revision o cumplimiento' })
  async exportLeadData(@Param('id') id: string, @Req() req: any) {
    return this.service.exportLeadData(id, req.organizationId);
  }

  @Delete('leads/:id/anonymize')
  @Roles(UserRole.ADMIN, UserRole.COMMERCIAL_DIRECTOR)
  @ApiOperation({ summary: 'Anonimizar un lead individual' })
  async anonymizeLead(@Param('id') id: string, @Req() req: any) {
    return this.service.anonymizeLead(id, req.organizationId, 'Solicitud manual de anonimizacion');
  }
}
