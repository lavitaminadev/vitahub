import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Onboarding } from './onboarding.entity';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(Onboarding) private repo: Repository<Onboarding>,
  ) {}

  async create(dto: any, organizationId: string) {
    const item = this.repo.create({ ...dto, organizationId });
    return this.repo.save(item);
  }

  async findAll(organizationId: string) {
    return this.repo.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const item = await this.repo.findOne({ where: { id, organizationId } });
    if (!item) throw new NotFoundException('Onboarding step not found');
    return item;
  }

  async update(id: string, dto: any, organizationId: string) {
    const item = await this.findOne(id, organizationId);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string, organizationId: string) {
    const item = await this.findOne(id, organizationId);
    return this.repo.remove(item);
  }
}
