import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateClientUseCase } from './create-client.use-case';
import { ListClientsUseCase } from './list-clients.use-case';
import { GetClientUseCase } from './get-client.use-case';

@ApiTags('Clientes')
@Controller('clients')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ClientsController {
  constructor(
    private createClient: CreateClientUseCase,
    private listClients: ListClientsUseCase,
    private getClient: GetClientUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo cliente' })
  create(@Body() dto: any, @Req() req: any) {
    return this.createClient.execute({ ...dto, organizationId: req.organizationId });
  }

  @Get()
  @ApiOperation({ summary: 'Listar clientes de la organización' })
  list(@Req() req: any) { return this.listClients.execute(req.organizationId); }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un cliente' })
  getOne(@Param('id') id: string, @Req() req: any) { return this.getClient.execute(id, req.organizationId); }
}
