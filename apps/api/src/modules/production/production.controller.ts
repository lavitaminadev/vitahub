import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AssignPieceUseCase } from './assign-piece.use-case';
import { SubmitVersionUseCase } from './submit-version.use-case';
import { RejectPieceUseCase } from './reject-piece.use-case';
import { DeliverPieceUseCase } from './deliver-piece.use-case';
import { ListPiecesUseCase } from './list-pieces.use-case';
import { PieceStatus } from './piece-status.enum';

@ApiTags('Producción')
@Controller('production/pieces')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ProductionController {
  constructor(
    private assignPiece: AssignPieceUseCase,
    private submitVer: SubmitVersionUseCase,
    private rejectPiece: RejectPieceUseCase,
    private deliverPiece: DeliverPieceUseCase,
    private listPieces: ListPiecesUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar piezas de producción' })
  list(@Query('status') status: PieceStatus, @Query('clientId') clientId: string, @Query('assignedTo') assignedTo: string, @Req() req: any) {
    return this.listPieces.execute(req.organizationId, status, clientId, assignedTo);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Asignar diseñador a una pieza' })
  assign(@Param('id') id: string, @Body() dto: { designerId: string }, @Req() req: any) {
    return this.assignPiece.execute(id, dto.designerId, req.organizationId);
  }

  @Post(':id/versions')
  @ApiOperation({ summary: 'Subir nueva versión de una pieza' })
  submitVersion(@Param('id') id: string, @Body() dto: { fileName: string; driveFileId?: string }, @Req() req: any) {
    return this.submitVer.execute(id, { ...dto, userId: req.user.id });
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Rechazar pieza y solicitar corrección' })
  reject(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.rejectPiece.execute(id, { ...dto, userId: req.user.id });
  }

  @Post(':id/deliver')
  @ApiOperation({ summary: 'Entregar pieza al cliente' })
  deliver(@Param('id') id: string, @Req() req: any) {
    return this.deliverPiece.execute(id, req.organizationId);
  }
}
