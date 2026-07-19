import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalRequest } from './approval-request.entity';
import { PieceVersion } from '../production/piece-version.entity';

function buildVersionUrl(driveFileId?: string): string | undefined {
  if (!driveFileId) return undefined;
  return `https://drive.google.com/file/d/${driveFileId}/view`;
}

@Injectable()
export class ListApprovalsUseCase {
  constructor(
    @InjectRepository(ApprovalRequest) private repo: Repository<ApprovalRequest>,
    @InjectRepository(PieceVersion) private versionRepo: Repository<PieceVersion>,
  ) {}

  async execute(organizationId: string, clientId?: string) {
    const where: any = { organizationId };
    if (clientId) where.clientId = clientId;
    const approvals = await this.repo.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['organization'],
    });
    return Promise.all(approvals.map(async (a) => {
      const latestVersion = a.entityType === 'piece'
        ? await this.versionRepo.findOne({ where: { pieceId: a.entityId }, order: { versionNumber: 'DESC' } })
        : null;

      return {
        id: a.id,
        pieceId: a.entityId,
        pieceTitle: a.title,
        clientName: a.description || '',
        requestedBy: a.requestedBy,
        status: a.status,
        createdAt: a.createdAt.toISOString(),
        decisionNotes: a.decisionNotes,
        dueAt: a.dueAt?.toISOString(),
        versionUrl: buildVersionUrl(latestVersion?.driveFileId),
      };
    }));
  }
}
