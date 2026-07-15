import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';

@Injectable()
export class ListClientsUseCase {
  constructor(
    @InjectRepository(Client) private repo: Repository<Client>,
  ) {}

  async execute(organizationId: string) {
    return this.repo.find({
      where: { organizationId },
      order: { name: 'ASC' },
      relations: ['lead'],
    });
  }
}
