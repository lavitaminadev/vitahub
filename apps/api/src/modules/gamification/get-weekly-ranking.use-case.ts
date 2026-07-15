import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { XPPeriod } from './xp-period.entity';

@Injectable()
export class GetWeeklyRankingUseCase {
  constructor(
    @InjectRepository(XPPeriod) private repo: Repository<XPPeriod>,
  ) {}

  async execute(organizationId: string) {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    return this.repo.find({
      where: { organizationId, weekStart },
      order: { totalXp: 'DESC' },
      relations: ['user'],
    });
  }
}
