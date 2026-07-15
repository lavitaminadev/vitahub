import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { XPPeriod } from '../../modules/gamification/xp-period.entity';
import { XPEvent } from '../../modules/gamification/xp-event.entity';
import { Client } from '../../modules/clients/client.entity';
import { UDBudget } from '../../modules/design-budget/ud-budget.entity';
import { Piece } from '../../modules/production/piece.entity';
import { Notification } from '../notifications/notification.entity';
import { CloseXpPeriodsJob } from './cron/close-xp-periods.job';
import { CreateMonthlyCyclesJob } from './cron/create-monthly-cycles.job';
import { DetectStalePiecesJob } from './cron/detect-stale-pieces.job';

@Module({
  imports: [TypeOrmModule.forFeature([XPPeriod, XPEvent, Client, UDBudget, Piece, Notification])],
  providers: [CloseXpPeriodsJob, CreateMonthlyCyclesJob, DetectStalePiecesJob],
  exports: [CloseXpPeriodsJob, CreateMonthlyCyclesJob, DetectStalePiecesJob],
})
export class JobsModule {}
