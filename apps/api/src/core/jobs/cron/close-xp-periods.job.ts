import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { XPPeriod } from '../../../modules/gamification/xp-period.entity';
import { XPEvent } from '../../../modules/gamification/xp-event.entity';
import { calculateWeeklyTier } from '../../../modules/gamification/xp-calculator';

@Injectable()
export class CloseXpPeriodsJob {
  private readonly logger = new Logger(CloseXpPeriodsJob.name);

  constructor(
    @InjectRepository(XPPeriod) private periodRepo: Repository<XPPeriod>,
    @InjectRepository(XPEvent) private eventRepo: Repository<XPEvent>,
  ) {}

  async handle(): Promise<void> {
    this.logger.log('Closing weekly XP periods...');
    const now = new Date();
    const endOfLastWeek = this.endOfLastWeek(now);

    const openPeriods = await this.periodRepo.find({
      where: { status: 'open', weekEnd: LessThan(endOfLastWeek) },
    });

    for (const period of openPeriods) {
      const result = await this.eventRepo
        .createQueryBuilder('e')
        .select('COALESCE(SUM(e.points), 0)', 'total')
        .where('e.xp_period_id = :periodId', { periodId: period.id })
        .getRawOne();

      const totalXp = Number(result?.total ?? 0);
      const tier = calculateWeeklyTier(totalXp);

      await this.periodRepo.update(period.id, {
        status: 'closed',
        totalXp,
        tier: tier ?? undefined,
        closedAt: new Date(),
      });

      this.logger.log(`Closed period ${period.id}: ${totalXp} XP, tier ${tier ?? 'none'}`);
    }

    this.logger.log(`Closed ${openPeriods.length} periods`);
  }

  private endOfLastWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
