import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BriefsService } from './briefs.service';

@ApiTags('Briefs')
@Controller('briefs')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class BriefsController {
  constructor(private service: BriefsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo brief' })
  create(@Body() dto: any, @Req() req: any) {
    return this.service.create(dto, req.organizationId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar briefs' })
  findAll(@Req() req: any) {
    return this.service.findAll(req.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un brief por ID' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.service.findOne(id, req.organizationId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un brief' })
  update(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.service.update(id, dto, req.organizationId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un brief' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.organizationId);
  }
}
