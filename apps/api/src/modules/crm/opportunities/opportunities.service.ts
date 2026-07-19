import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity } from './opportunity.entity';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';

/**
 * Business logic for CRM opportunities.
 */
@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity) private readonly repo: Repository<Opportunity>,
  ) {}

  async create(dto: CreateOpportunityDto, organizationId: string): Promise<Opportunity> {
    const opportunity = this.repo.create({ ...dto, organizationId });
    return this.repo.save(opportunity);
  }

  async findAll(
    organizationId: string,
    limit = 50,
    offset = 0,
    leadId?: string,
  ): Promise<{ data: Opportunity[]; total: number; limit: number; offset: number }> {
    const where: Record<string, unknown> = { organizationId };
    if (leadId) where.leadId = leadId;

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { data, total, limit, offset };
  }

  async findOne(id: string, organizationId: string): Promise<Opportunity> {
    const opportunity = await this.repo.findOne({ where: { id, organizationId } });
    if (!opportunity) throw new NotFoundException('Opportunity not found');
    return opportunity;
  }

  async update(id: string, dto: UpdateOpportunityDto, organizationId: string): Promise<Opportunity> {
    const opportunity = await this.findOne(id, organizationId);
    Object.assign(opportunity, dto);
    return this.repo.save(opportunity);
  }

  async remove(id: string, organizationId: string): Promise<Opportunity> {
    const opportunity = await this.findOne(id, organizationId);
    return this.repo.remove(opportunity);
  }
}
