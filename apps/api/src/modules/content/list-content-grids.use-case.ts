import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentGrid } from './content-grid.entity';

@Injectable()
export class ListContentGridsUseCase {
  constructor(
    @InjectRepository(ContentGrid) private repo: Repository<ContentGrid>,
  ) {}

  async execute(organizationId: string, clientId?: string) {
    const where: any = { organizationId };
    if (clientId) where.clientId = clientId;
    return this.repo.find({ where, order: { weekStart: 'DESC' }, relations: ['contentItems'] });
  }
}
