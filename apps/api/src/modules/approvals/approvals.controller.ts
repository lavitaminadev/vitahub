import { Controller, Get, Put, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ListApprovalsUseCase } from './list-approvals.use-case';
import { UpdateApprovalStatusUseCase } from './update-approval-status.use-case';

@ApiTags('Aprobaciones')
@Controller('approvals')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ApprovalsController {
  constructor(
    private listApprovals: ListApprovalsUseCase,
    private updateStatus: UpdateApprovalStatusUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar solicitudes de aprobación' })
  list(@Req() req: any) {
    return this.listApprovals.execute(req.organizationId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Aprobar o rechazar solicitud' })
  update(@Param('id') id: string, @Body() dto: { status: string; decisionNotes?: string }, @Req() req: any) {
    return this.updateStatus.execute(id, dto.status, dto.decisionNotes, req.user.id);
  }
}
