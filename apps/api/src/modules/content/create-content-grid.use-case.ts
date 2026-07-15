import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentGrid } from './content-grid.entity';

@Injectable()
export class CreateContentGridUseCase {
  constructor(
    @InjectRepository(ContentGrid) private repo: Repository<ContentGrid>,
  ) {}

  async execute(data: { organizationId: string; clientId: string; title: string; weekStart: Date; weekEnd: Date; notes?: string }) {
    const grid = this.repo.create(data);
    return this.repo.save(grid);
  }
}
