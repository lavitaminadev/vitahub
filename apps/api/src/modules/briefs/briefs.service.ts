import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brief } from './brief.entity';

@Injectable()
export class BriefsService {
  constructor(
    @InjectRepository(Brief) private repo: Repository<Brief>,
  ) {}

  async create(dto: any, organizationId: string) {
    const brief = this.repo.create({ ...dto, organizationId });
    return this.repo.save(brief);
  }

  async findAll(organizationId: string) {
    return this.repo.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const brief = await this.repo.findOne({ where: { id, organizationId } });
    if (!brief) throw new NotFoundException('Brief not found');
    return brief;
  }

  async update(id: string, dto: any, organizationId: string) {
    const brief = await this.findOne(id, organizationId);
    Object.assign(brief, dto);
    return this.repo.save(brief);
  }

  async remove(id: string, organizationId: string) {
    const brief = await this.findOne(id, organizationId);
    return this.repo.remove(brief);
  }
}
