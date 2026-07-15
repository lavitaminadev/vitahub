import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateContentGridUseCase } from './create-content-grid.use-case';
import { ListContentGridsUseCase } from './list-content-grids.use-case';

@ApiTags('Parrillas de Contenido')
@Controller('content/grids')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ContentController {
  constructor(
    private createGrid: CreateContentGridUseCase,
    private listGrids: ListContentGridsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear parrilla de contenido semanal' })
  create(@Body() dto: any, @Req() req: any) {
    return this.createGrid.execute({ ...dto, organizationId: req.organizationId });
  }

  @Get()
  @ApiOperation({ summary: 'Listar parrillas de contenido' })
  list(@Query('clientId') clientId: string, @Req() req: any) {
    return this.listGrids.execute(req.organizationId, clientId);
  }
}
