import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalRequest } from './approval-request.entity';
import { ApprovalRequestStatus } from './approval-request-status.enum';
import { Piece } from '../production/piece.entity';
import { PieceStatus } from '../production/piece-status.enum';
import { UserRole } from '../organizations/user-role.enum';

@Injectable()
export class UpdateApprovalStatusUseCase {
  constructor(
    @InjectRepository(ApprovalRequest) private repo: Repository<ApprovalRequest>,
    @InjectRepository(Piece) private pieceRepo: Repository<Piece>,
  ) {}

  async execute(
    id: string,
    organizationId: string,
    actor: { userId?: string; role: UserRole; clientId?: string },
    status: string,
    decisionNotes?: string,
  ) {
    const approval = await this.repo.findOne({ where: { id, organizationId } });
    if (!approval) throw new NotFoundException('Approval request not found');
    if (actor.role === UserRole.CLIENT && approval.clientId && approval.clientId !== actor.clientId) {
      throw new NotFoundException('Approval request not found');
    }

    if (!Object.values(ApprovalRequestStatus).includes(status as ApprovalRequestStatus)) {
      throw new Error(`Invalid status: ${status}`);
    }

    approval.status = status as ApprovalRequestStatus;
    approval.decisionAt = new Date();
    approval.decisionNotes = decisionNotes || undefined;
    if (actor.userId) approval.assignedTo = actor.userId;

    if (approval.entityType === 'piece') {
      const piece = await this.pieceRepo.findOne({ where: { id: approval.entityId, organizationId } });
      if (piece) {
        if (status === ApprovalRequestStatus.APPROVED) piece.status = PieceStatus.APPROVED;
        if (status === ApprovalRequestStatus.REJECTED) piece.status = PieceStatus.CORRECTION;
        await this.pieceRepo.save(piece);
      }
    }

    return this.repo.save(approval);
  }
}
