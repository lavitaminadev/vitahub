import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting } from './meeting.entity';

@Injectable()
export class ListMeetingsUseCase {
  constructor(
    @InjectRepository(Meeting) private repo: Repository<Meeting>,
  ) {}

  async execute(organizationId: string, type?: string, clientId?: string) {
    const where: any = { organizationId };
    if (type) where.type = type;
    if (clientId) where.clientId = clientId;
    return this.repo.find({ where, order: { scheduledAt: 'DESC' } });
  }
}
