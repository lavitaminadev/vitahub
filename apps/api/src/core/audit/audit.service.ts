import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog) private repo: Repository<AuditLog>,
  ) {}

  async log(params: {
    organizationId: string;
    actorId?: string;
    entityType: string;
    entityId: string;
    action: string;
    before?: any;
    after?: any;
    reason?: string;
    ipAddress?: string;
  }) {
    const entry = this.repo.create(params);
    return this.repo.save(entry);
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.repo.find({
      where: { entityType, entityId },
      order: { occurredAt: 'DESC' },
      take: 50,
    });
  }

  async findByOrganization(organizationId: string, limit = 100) {
    return this.repo.find({
      where: { organizationId },
      order: { occurredAt: 'DESC' },
      take: limit,
    });
  }
}
