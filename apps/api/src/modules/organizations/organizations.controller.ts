import { Controller, Get, Post, Put, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateOrganizationUseCase } from './create-organization.use-case';
import { ListOrganizationsUseCase } from './list-organizations.use-case';

@ApiTags('Organizaciones')
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private createOrg: CreateOrganizationUseCase,
    private listOrgs: ListOrganizationsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una organización' })
  create(@Body() dto: { name: string; code: string; currency?: string }) {
    return this.createOrg.execute(dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar organizaciones' })
  list() {
    return this.listOrgs.execute();
  }

  @Put('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar perfil de la organización' })
  updateProfile(@Req() req: any, @Body() dto: { name?: string; currency?: string }) {
    return this.createOrg.executeUpdate(req.organizationId, dto);
  }
}
