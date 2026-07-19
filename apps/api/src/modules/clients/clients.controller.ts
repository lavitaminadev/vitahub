import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClientUseCase } from './create-client.use-case';
import { ListClientsUseCase } from './list-clients.use-case';
import { GetClientUseCase } from './get-client.use-case';
import { Client } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { Roles } from '../../core/authorization/roles.decorator';
import { UserRole } from '../organizations/user-role.enum';
import type { AuthenticatedRequest } from '@shared/types/request';

@ApiTags('Clientes')
@Controller('clients')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ClientsController {
  constructor(
    @InjectRepository(Client) private repo: Repository<Client>,
    private createClient: CreateClientUseCase,
    private listClients: ListClientsUseCase,
    private getClient: GetClientUseCase,
  ) {}

  @Post()
  @Roles(UserRole.COMMERCIAL_DIRECTOR, UserRole.OPERATIONS_DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo cliente' })
  create(@Body() dto: CreateClientDto, @Req() req: AuthenticatedRequest) {
    return this.createClient.execute({ ...dto, organizationId: req.organizationId });
  }

  @Get()
  @ApiOperation({ summary: 'Listar clientes de la organizacion' })
  async list(@Req() req: AuthenticatedRequest) {
    if (req.user.role === UserRole.CLIENT) {
      if (!req.user.clientId) return [];
      return this.repo.find({ where: { id: req.user.clientId, organizationId: req.organizationId } });
    }
    return this.listClients.execute(req.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un cliente' })
  getOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    if (req.user.role === UserRole.CLIENT && req.user.clientId !== id) {
      throw new NotFoundException('Client not found');
    }
    return this.getClient.execute(id, req.organizationId);
  }

  @Put(':id')
  @Roles(UserRole.COMMERCIAL_DIRECTOR, UserRole.OPERATIONS_DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un cliente' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateClientDto>, @Req() req: AuthenticatedRequest) {
    const client = await this.repo.findOne({ where: { id, organizationId: req.organizationId } });
    if (!client) throw new NotFoundException('Client not found');
    Object.assign(client, dto);
    return this.repo.save(client);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar un cliente' })
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const client = await this.repo.findOne({ where: { id, organizationId: req.organizationId } });
    if (!client) throw new NotFoundException('Client not found');
    return this.repo.remove(client);
  }
}
