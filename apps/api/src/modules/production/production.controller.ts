import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AssignPieceUseCase } from './assign-piece.use-case';
import { SubmitVersionUseCase } from './submit-version.use-case';
import { RejectPieceUseCase } from './reject-piece.use-case';
import { DeliverPieceUseCase } from './deliver-piece.use-case';
import { ListPiecesUseCase } from './list-pieces.use-case';
import { Piece } from './piece.entity';
import { PieceStatus } from './piece-status.enum';
import { AssignPieceDto } from './dto/assign-piece.dto';
import { SubmitVersionDto } from './dto/submit-version.dto';
import { RejectPieceDto } from './dto/reject-piece.dto';
import { CreatePieceDto } from './dto/create-piece.dto';
import { Roles } from '../../core/authorization/roles.decorator';
import { UserRole } from '../organizations/user-role.enum';
import type { AuthenticatedRequest } from '@shared/types/request';
import { ApprovalRequest } from '../approvals/approval-request.entity';
import { ApprovalRequestStatus } from '../approvals/approval-request-status.enum';
import { PieceVersion } from './piece-version.entity';

@ApiTags('Produccion')
@Controller('production/pieces')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ProductionController {
  constructor(
    @InjectRepository(Piece) private pieceRepo: Repository<Piece>,
    @InjectRepository(ApprovalRequest) private approvalRepo: Repository<ApprovalRequest>,
    @InjectRepository(PieceVersion) private versionRepo: Repository<PieceVersion>,
    private assignPiece: AssignPieceUseCase,
    private submitVer: SubmitVersionUseCase,
    private rejectPiece: RejectPieceUseCase,
    private deliverPiece: DeliverPieceUseCase,
    private listPieces: ListPiecesUseCase,
  ) {}

  @Post()
  @Roles(UserRole.ART_DIRECTOR, UserRole.OPERATIONS_DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear una nueva pieza' })
  async create(@Body() dto: CreatePieceDto, @Req() req: AuthenticatedRequest) {
    const piece = this.pieceRepo.create({
      ...dto as any,
      organizationId: req.organizationId,
      status: dto.status as PieceStatus || PieceStatus.BACKLOG,
    });
    return this.pieceRepo.save(piece);
  }

  @Get()
  @ApiOperation({ summary: 'Listar piezas de produccion' })
  list(@Query('status') status: PieceStatus, @Query('clientId') clientId: string, @Query('assignedTo') assignedTo: string, @Req() req: AuthenticatedRequest) {
    return this.listPieces.execute(req.organizationId, status, clientId, assignedTo);
  }

  @Post(':id/assign')
  @Roles(UserRole.ART_DIRECTOR, UserRole.OPERATIONS_DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Asignar responsable a una pieza' })
  assign(@Param('id') id: string, @Body() dto: AssignPieceDto, @Req() req: AuthenticatedRequest) {
    return this.assignPiece.execute(id, dto.designerId, req.organizationId);
  }

  @Post(':id/versions')
  @Roles(UserRole.DESIGNER, UserRole.AUDIOVISUAL, UserRole.ADMIN)
  @ApiOperation({ summary: 'Subir nueva version de una pieza' })
  submitVersion(@Param('id') id: string, @Body() dto: SubmitVersionDto, @Req() req: AuthenticatedRequest) {
    return this.submitVer.execute(id, { ...dto, userId: req.user.id });
  }

  @Post(':id/reject')
  @Roles(UserRole.ART_DIRECTOR, UserRole.CREATIVE_DIRECTOR, UserRole.COMMUNITY_MANAGER, UserRole.ADMIN, UserRole.CLIENT)
  @ApiOperation({ summary: 'Rechazar pieza y solicitar correccion' })
  reject(@Param('id') id: string, @Body() dto: RejectPieceDto, @Req() req: AuthenticatedRequest) {
    return this.rejectPiece.execute(id, { ...dto, userId: req.user.id });
  }

  @Post(':id/deliver')
  @Roles(UserRole.ART_DIRECTOR, UserRole.OPERATIONS_DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Entregar pieza al cliente' })
  deliver(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.deliverPiece.execute(id, req.organizationId);
  }

  @Post(':id/approve')
  @Roles(UserRole.ART_DIRECTOR, UserRole.CREATIVE_DIRECTOR, UserRole.COMMUNITY_MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Aprobar pieza internamente' })
  async approve(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const piece = await this.pieceRepo.findOne({ where: { id, organizationId: req.organizationId } });
    if (!piece) throw new NotFoundException('Piece not found');
    piece.status = PieceStatus.APPROVED;
    return this.pieceRepo.save(piece);
  }

  @Post(':id/start')
  @Roles(UserRole.DESIGNER, UserRole.ART_DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Iniciar progreso de una pieza' })
  async startProgress(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const piece = await this.pieceRepo.findOne({ where: { id, organizationId: req.organizationId } });
    if (!piece) throw new NotFoundException('Piece not found');
    piece.status = PieceStatus.IN_PROGRESS;
    return this.pieceRepo.save(piece);
  }

  @Post(':id/send-to-client')
  @Roles(UserRole.ART_DIRECTOR, UserRole.OPERATIONS_DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Enviar pieza a validacion del cliente' })
  async sendToClient(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const piece = await this.pieceRepo.findOne({ where: { id, organizationId: req.organizationId }, relations: ['client'] });
    if (!piece) throw new NotFoundException('Piece not found');

    piece.status = PieceStatus.CLIENT_VALIDATION;
    await this.pieceRepo.save(piece);

    const latestVersion = await this.versionRepo.findOne({
      where: { pieceId: piece.id },
      order: { versionNumber: 'DESC' },
    });

    const existingPending = await this.approvalRepo.findOne({
      where: {
        organizationId: req.organizationId,
        entityType: 'piece',
        entityId: piece.id,
        status: ApprovalRequestStatus.PENDING,
      },
    });

    if (!existingPending) {
      await this.approvalRepo.save(this.approvalRepo.create({
        organizationId: req.organizationId,
        clientId: piece.clientId,
        title: piece.title,
        description: piece.client?.name,
        entityType: 'piece',
        entityId: piece.id,
        requestedBy: req.user.id,
        dueAt: piece.deadlineAt,
        decisionNotes: latestVersion?.driveFileId,
      }));
    }

    return piece;
  }
}
