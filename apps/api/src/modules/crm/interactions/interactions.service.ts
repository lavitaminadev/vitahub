import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interaction } from './interaction.entity';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';

/**
 * Business logic for CRM interactions.
 */
@Injectable()
export class InteractionsService {
  constructor(
    @InjectRepository(Interaction) private readonly repo: Repository<Interaction>,
  ) {}

  async create(dto: CreateInteractionDto, organizationId: string): Promise<Interaction> {
    const interaction = this.repo.create({ ...dto, organizationId });
    return this.repo.save(interaction);
  }

  async findAll(
    organizationId: string,
    limit = 50,
    offset = 0,
    leadId?: string,
  ): Promise<{ data: Interaction[]; total: number; limit: number; offset: number }> {
    const where: Record<string, unknown> = { organizationId };
    if (leadId) where.leadId = leadId;

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { date: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { data, total, limit, offset };
  }

  async findOne(id: string, organizationId: string): Promise<Interaction> {
    const interaction = await this.repo.findOne({ where: { id, organizationId } });
    if (!interaction) throw new NotFoundException('Interaction not found');
    return interaction;
  }

  async update(id: string, dto: UpdateInteractionDto, organizationId: string): Promise<Interaction> {
    const interaction = await this.findOne(id, organizationId);
    Object.assign(interaction, dto);
    return this.repo.save(interaction);
  }

  async remove(id: string, organizationId: string): Promise<Interaction> {
    const interaction = await this.findOne(id, organizationId);
    return this.repo.remove(interaction);
  }
}
