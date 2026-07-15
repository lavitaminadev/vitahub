import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalRequest } from './approval-request.entity';

@Injectable()
export class ListApprovalsUseCase {
  constructor(
    @InjectRepository(ApprovalRequest) private repo: Repository<ApprovalRequest>,
  ) {}

  async execute(organizationId: string) {
    const approvals = await this.repo.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      relations: ['organization'],
    });
    return approvals.map((a) => ({
      id: a.id,
      pieceTitle: a.title,
      clientName: a.description || '',
      requestedBy: a.requestedBy,
      status: a.status,
      createdAt: a.createdAt.toISOString(),
      versionUrl: undefined,
    }));
  }
}
