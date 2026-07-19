import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { Roles } from '../../core/authorization/roles.decorator';
import { UserRole } from '../organizations/user-role.enum';
import type { AuthenticatedRequest } from '@shared/types/request';

@ApiTags('Documentos')
@Controller('documents')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class DocumentsController {
  constructor(private service: DocumentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS_DIRECTOR)
  @ApiOperation({ summary: 'Crear un nuevo documento' })
  create(@Body() dto: CreateDocumentDto, @Req() req: AuthenticatedRequest) {
    return this.service.create(dto, req.organizationId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar documentos' })
  findAll(@Query() query: PaginationDto, @Req() req: AuthenticatedRequest) {
    const clientId = req.user?.role === 'client' ? req.user.clientId : undefined;
    return this.service.findAll(req.organizationId, query.limit, query.offset, clientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un documento por ID' })
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.service.findOne(id, req.organizationId);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS_DIRECTOR)
  @ApiOperation({ summary: 'Actualizar un documento' })
  update(@Param('id') id: string, @Body() dto: UpdateDocumentDto, @Req() req: AuthenticatedRequest) {
    return this.service.update(id, dto, req.organizationId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar un documento' })
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.service.remove(id, req.organizationId);
  }
}
