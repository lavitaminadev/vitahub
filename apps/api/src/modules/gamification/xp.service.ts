import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { XPPeriod } from './xp-period.entity';
import { XPEvent } from './xp-event.entity';
import { XPEventType } from './xp-event-type.enum';
import { Piece } from '../production/piece.entity';
import { calculateDeliveryXp, calculateWeeklyTier, EXPECTED_HOURS } from './xp-calculator';

@Injectable()
export class XPService {
  constructor(
    @InjectRepository(XPPeriod) private periodRepo: Repository<XPPeriod>,
    @InjectRepository(XPEvent) private eventRepo: Repository<XPEvent>,
  ) {}

  async registerDelivery(piece: Piece, designerId: string, deliveredAt: Date): Promise<void> {
    const period = await this.ensurePeriod(designerId, deliveredAt);
    const level = piece.difficultyLevel ?? 1;
    const expectedHours = this.expectedHoursForLevel(level);
    const elapsedHours = this.hoursDiff(piece.createdAt, deliveredAt);

    const maxVersion = await this.eventRepo.manager
      .createQueryBuilder()
      .select('MAX(pv.version_number)', 'max')
      .from('piece_versions', 'pv')
      .where('pv.piece_id = :pieceId', { pieceId: piece.id })
      .getRawOne();
    // fallback: check if any version has naming_valid
    const namingValid = await this.eventRepo.manager
      .createQueryBuilder()
      .select('pv.naming_valid', 'valid')
      .from('piece_versions', 'pv')
      .where('pv.piece_id = :pieceId', { pieceId: piece.id })
      .andWhere('pv.naming_valid IS NOT NULL')
      .orderBy('pv.version_number', 'DESC')
      .getRawOne();
    const perfectNaming = namingValid?.valid === true;

    const hadDesignerError = await this.eventRepo.manager
      .createQueryBuilder()
      .select('1')
      .from('corrections', 'c')
      .where('c.piece_id = :pieceId', { pieceId: piece.id })
      .andWhere('c.origin = :origin', { origin: 'designer_error' })
      .getRawOne();
    const points = calculateDeliveryXp({
      difficultyLevel: level,
      actualHours: elapsedHours,
      expectedHours,
      perfectNaming,
      hadDesignerErrorCorrection: !!hadDesignerError,
      delayJustification: null,
    });

    const event = this.eventRepo.create({
      xpPeriodId: period.id,
      userId: designerId,
      pieceId: piece.id,
      eventType: XPEventType.BASE_DELIVERY,
      points,
      description: `Entrega de ${piece.title} (N${level})`,
      metadata: {
        elapsed_hours: elapsedHours,
        expected_hours: expectedHours,
        perfect_naming: perfectNaming,
        had_designer_error: !!hadDesignerError,
      },
    });
    await this.eventRepo.save(event);
    await this.recalculatePeriod(period);
  }

  async registerDesignerErrorPenalty(piece: Piece, designerId: string): Promise<void> {
    const period = await this.ensurePeriod(designerId, new Date());

    const event = this.eventRepo.create({
      xpPeriodId: period.id,
      userId: designerId,
      pieceId: piece.id,
      eventType: XPEventType.CORRECTION_PENALTY,
      points: -5,
      description: 'Corrección por error del diseñador',
    });
    await this.eventRepo.save(event);
    await this.recalculatePeriod(period);
  }

  async ensurePeriod(userId: string, date: Date): Promise<XPPeriod> {
    const start = this.startOfWeek(date);
    const end = this.endOfWeek(date);

    const existing = await this.periodRepo.findOne({ where: { userId, weekStart: start } });
    if (existing) return existing;

    const period = this.periodRepo.create({
      userId,
      weekStart: start,
      weekEnd: end,
      status: 'open',
      totalXp: 0,
    });
    return this.periodRepo.save(period);
  }

  async recalculatePeriod(period: XPPeriod): Promise<void> {
    const result = await this.eventRepo
      .createQueryBuilder('e')
      .select('COALESCE(SUM(e.points), 0)', 'total')
      .where('e.xp_period_id = :periodId', { periodId: period.id })
      .getRawOne();

    const total = Number(result?.total ?? 0);
    const tier = calculateWeeklyTier(total);

    await this.periodRepo.update(period.id, {
      totalXp: total,
      tier: tier ?? undefined,
    });
  }

  protected expectedHoursForLevel(level: number): number {
    return EXPECTED_HOURS[level] ?? 1;
  }

  private startOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private endOfWeek(date: Date): Date {
    const d = this.startOfWeek(date);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  private hoursDiff(a: Date, b: Date): number {
    return Math.abs(b.getTime() - a.getTime()) / 36_000_000;
  }
}
