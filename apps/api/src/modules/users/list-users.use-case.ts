import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
  ) {}

  async execute(organizationId?: string) {
    const where: any = {};
    if (organizationId) where.organizationId = organizationId;
    return this.repo.find({ where, order: { name: 'ASC' }, relations: ['organization'] });
  }
}
