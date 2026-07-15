import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../lead.entity';
import { LeadStatus } from '../lead-status.enum';

@Injectable()
export class UpdateLeadUseCase {
  constructor(
    @InjectRepository(Lead) private repo: Repository<Lead>,
  ) {}

  async execute(id: string, data: { status?: string; notes?: string }, organizationId: string) {
    const lead = await this.repo.findOne({ where: { id, organizationId } });
    if (!lead) throw new NotFoundException('Lead not found');

    if (data.status && Object.values(LeadStatus).includes(data.status as LeadStatus)) {
      lead.status = data.status as LeadStatus;
    }
    if (data.notes !== undefined) lead.notes = data.notes;

    return this.repo.save(lead);
  }
}
