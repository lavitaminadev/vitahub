import { Controller, Get, Post, Put, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListApprovalsUseCase } from './list-approvals.use-case';
import { UpdateApprovalStatusUseCase } from './update-approval-status.use-case';
import { UpdateApprovalDto } from './dto/update-approval.dto';
import { ApprovalRequest } from './approval-request.entity';
import { Roles } from '../../core/authorization/roles.decorator';
import { UserRole } from '../organizations/user-role.enum';
import type { AuthenticatedRequest } from '@shared/types/request';

@ApiTags('Aprobaciones')
@Controller('approvals')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ApprovalsController {
  constructor(
    private listApprovals: ListApprovalsUseCase,
    private updateStatus: UpdateApprovalStatusUseCase,
    @InjectRepository(ApprovalRequest) private repo: Repository<ApprovalRequest>,
  ) {}

  @Post()
  @Roles(UserRole.COMMUNITY_MANAGER, UserRole.CREATIVE_DIRECTOR, UserRole.ART_DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear solicitud de aprobación' })
  create(@Body() dto: any, @Req() req: AuthenticatedRequest) {
    return this.repo.save({ ...dto, organizationId: req.organizationId, requestedBy: req.user.id });
  }

  @Get()
  @ApiOperation({ summary: 'Listar solicitudes de aprobación' })
  list(@Req() req: AuthenticatedRequest) {
    const clientId = req.user?.role === 'client' ? req.user.clientId : undefined;
    return this.listApprovals.execute(req.organizationId, clientId);
  }

  @Put(':id')
  @Roles(UserRole.ART_DIRECTOR, UserRole.CREATIVE_DIRECTOR, UserRole.COMMUNITY_MANAGER, UserRole.ADMIN, UserRole.CLIENT)
  @ApiOperation({ summary: 'Aprobar o rechazar solicitud' })
  update(@Param('id') id: string, @Body() dto: UpdateApprovalDto, @Req() req: AuthenticatedRequest) {
    return this.updateStatus.execute(
      id,
      req.organizationId,
      { userId: req.user.id, role: req.user.role as UserRole, clientId: req.user.clientId },
      dto.status,
      dto.decisionNotes,
    );
  }
}
