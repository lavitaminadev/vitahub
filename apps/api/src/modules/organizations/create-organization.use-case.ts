import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './organization.entity';

@Injectable()
export class CreateOrganizationUseCase {
  constructor(
    @InjectRepository(Organization) private repo: Repository<Organization>,
  ) {}

  async execute(data: { name: string; code: string; currency?: string }) {
    const org = this.repo.create(data);
    return this.repo.save(org);
  }

  async executeUpdate(id: string, data: { name?: string; currency?: string }) {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }
}
