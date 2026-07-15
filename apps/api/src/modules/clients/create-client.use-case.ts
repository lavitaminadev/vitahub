import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';

@Injectable()
export class CreateClientUseCase {
  constructor(
    @InjectRepository(Client) private repo: Repository<Client>,
  ) {}

  async execute(data: {
    organizationId: string;
    name: string;
    legalName?: string;
    industry?: string;
    communityManagerId?: string;
    leadId?: string;
    retainerAmount?: number;
    currency?: string;
    defaultUdBudget?: number;
  }) {
    const client = this.repo.create(data);
    return this.repo.save(client);
  }
}
