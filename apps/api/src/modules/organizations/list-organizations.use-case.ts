import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './organization.entity';

@Injectable()
export class ListOrganizationsUseCase {
  constructor(
    @InjectRepository(Organization) private repo: Repository<Organization>,
  ) {}

  async execute() {
    return this.repo.find({ order: { name: 'ASC' } });
  }
}
