import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../lead.entity';

@Injectable()
export class CreateLeadUseCase {
  constructor(
    @InjectRepository(Lead) private repo: Repository<Lead>,
  ) {}

  async execute(data: {
    organizationId: string;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    source?: string;
    notes?: string;
  }) {
    const lead = this.repo.create(data);
    return this.repo.save(lead);
  }
}
