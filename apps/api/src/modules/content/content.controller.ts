import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContentGridUseCase } from './create-content-grid.use-case';
import { ListContentGridsUseCase } from './list-content-grids.use-case';
import { CreateGridDto } from './dto/create-grid.dto';
import { ContentItem } from './content-item.entity';
import { Roles } from '../../core/authorization/roles.decorator';
import { UserRole } from '../organizations/user-role.enum';
import type { AuthenticatedRequest } from '@shared/types/request';

@ApiTags('Parrillas de Contenido')
@Controller()
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ContentController {
  constructor(
    private createGrid: CreateContentGridUseCase,
    private listGrids: ListContentGridsUseCase,
    @InjectRepository(ContentItem) private itemRepo: Repository<ContentItem>,
  ) {}

  @Post('content/grids')
  @Roles(UserRole.COMMUNITY_MANAGER, UserRole.CREATIVE_DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear parrilla de contenido semanal' })
  create(@Body() dto: CreateGridDto, @Req() req: AuthenticatedRequest) {
    return this.createGrid.execute({
      ...dto,
      organizationId: req.organizationId,
      weekStart: new Date(dto.weekStart),
      weekEnd: new Date(dto.weekEnd),
    });
  }

  @Get('content/grids')
  @ApiOperation({ summary: 'Listar parrillas de contenido' })
  list(@Query('clientId') clientId: string, @Req() req: AuthenticatedRequest) {
    const effectiveClientId = req.user?.role === UserRole.CLIENT ? req.user.clientId : clientId;
    return this.listGrids.execute(req.organizationId, effectiveClientId);
  }

  @Put('content/items/:id')
  @Roles(UserRole.COMMUNITY_MANAGER, UserRole.CREATIVE_DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar item de contenido' })
  async updateItem(@Param('id') id: string, @Body() dto: any, @Req() req: AuthenticatedRequest) {
    const item = await this.itemRepo.findOne({ where: { id }, relations: ['contentGrid'] });
    if (!item || item.contentGrid.organizationId !== req.organizationId) {
      throw new NotFoundException('Content item not found');
    }
    Object.assign(item, dto);
    return this.itemRepo.save(item);
  }

  @Delete('content/items/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar item de contenido' })
  async deleteItem(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const item = await this.itemRepo.findOne({ where: { id }, relations: ['contentGrid'] });
    if (!item || item.contentGrid.organizationId !== req.organizationId) {
      throw new NotFoundException('Content item not found');
    }
    return this.itemRepo.remove(item);
  }
}
