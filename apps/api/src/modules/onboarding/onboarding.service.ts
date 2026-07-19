import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Onboarding } from './onboarding.entity';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { STANDARD_ONBOARDING_STEPS } from './onboarding-template';

/**
 * Business logic for client onboarding steps.
 */
@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(Onboarding) private readonly repo: Repository<Onboarding>,
  ) {}

  async create(dto: CreateOnboardingDto, organizationId: string): Promise<Onboarding> {
    const item = this.repo.create({ ...dto, organizationId });
    return this.repo.save(item);
  }

  async findAll(organizationId: string, limit = 50, offset = 0): Promise<{ data: Onboarding[]; total: number; limit: number; offset: number }> {
    const [data, total] = await this.repo.findAndCount({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { data, total, limit, offset };
  }

  async findOne(id: string, organizationId: string): Promise<Onboarding> {
    const item = await this.repo.findOne({ where: { id, organizationId } });
    if (!item) throw new NotFoundException('Onboarding step not found');
    return item;
  }

  async update(id: string, dto: UpdateOnboardingDto, organizationId: string): Promise<Onboarding> {
    const item = await this.findOne(id, organizationId);
    Object.assign(item, dto);
    if (dto.status === 'completed' && !item.completedAt) item.completedAt = new Date();
    if (dto.status && dto.status !== 'completed') item.completedAt = undefined;
    return this.repo.save(item);
  }

  async remove(id: string, organizationId: string): Promise<Onboarding> {
    const item = await this.findOne(id, organizationId);
    return this.repo.remove(item);
  }

  async createStandardChecklist(clientId: string, organizationId: string): Promise<Onboarding[]> {
    const existing = await this.repo.find({ where: { clientId, organizationId } });
    const existingSteps = new Set(existing.map((item) => item.step.trim().toLowerCase()));

    const missing = STANDARD_ONBOARDING_STEPS
      .filter((step) => !existingSteps.has(step.toLowerCase()))
      .map((step) => this.repo.create({
        clientId,
        organizationId,
        step,
        status: 'pending',
      }));

    if (missing.length === 0) return existing;
    return this.repo.save(missing);
  }
}
