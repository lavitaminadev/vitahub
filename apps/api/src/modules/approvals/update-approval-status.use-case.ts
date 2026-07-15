import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalRequest } from './approval-request.entity';
import { ApprovalRequestStatus } from './approval-request-status.enum';

@Injectable()
export class UpdateApprovalStatusUseCase {
  constructor(
    @InjectRepository(ApprovalRequest) private repo: Repository<ApprovalRequest>,
  ) {}

  async execute(id: string, status: string, decisionNotes?: string, userId?: string) {
    const approval = await this.repo.findOne({ where: { id } });
    if (!approval) throw new NotFoundException('Approval request not found');

    if (!Object.values(ApprovalRequestStatus).includes(status as ApprovalRequestStatus)) {
      throw new Error(`Invalid status: ${status}`);
    }

    approval.status = status as ApprovalRequestStatus;
    approval.decisionAt = new Date();
    approval.decisionNotes = decisionNotes || undefined;
    if (userId) approval.assignedTo = userId;

    return this.repo.save(approval);
  }
}
