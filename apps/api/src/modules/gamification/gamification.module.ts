import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { XPPeriod } from './xp-period.entity';
import { XPEvent } from './xp-event.entity';
import { GamificationController } from './gamification.controller';
import { RegisterXpUseCase } from './register-xp.use-case';
import { GetWeeklyRankingUseCase } from './get-weekly-ranking.use-case';
import { XPService } from './xp.service';

@Module({
  imports: [TypeOrmModule.forFeature([XPPeriod, XPEvent])],
  controllers: [GamificationController],
  providers: [RegisterXpUseCase, GetWeeklyRankingUseCase, XPService],
  exports: [XPService, TypeOrmModule],
})
export class GamificationModule {}
