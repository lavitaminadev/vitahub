import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DocumentsService } from './documents.service';

@ApiTags('Documentos')
@Controller('documents')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class DocumentsController {
  constructor(private service: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo documento' })
  create(@Body() dto: any, @Req() req: any) {
    return this.service.create(dto, req.organizationId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar documentos' })
  findAll(@Req() req: any) {
    return this.service.findAll(req.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un documento por ID' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.service.findOne(id, req.organizationId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un documento' })
  update(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.service.update(id, dto, req.organizationId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un documento' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.organizationId);
  }
}
