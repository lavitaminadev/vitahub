import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Piece } from '../../../modules/production/piece.entity';
import { PieceVersion } from '../../../modules/production/piece-version.entity';
import { Client } from '../../../modules/clients/client.entity';
import { XPEvent } from '../../../modules/gamification/xp-event.entity';
import { XPPeriod } from '../../../modules/gamification/xp-period.entity';
import { Notification } from '../../notifications/notification.entity';
import { calculateDeliveryXp, EXPECTED_HOURS } from '../../../modules/gamification/xp-calculator';
import { XPEventType } from '../../../modules/gamification/xp-event-type.enum';

@Injectable()
export class PieceDeliveredHandler {
  constructor(
    @InjectRepository(Piece) private pieceRepo: Repository<Piece>,
    @InjectRepository(PieceVersion) private versionRepo: Repository<PieceVersion>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    @InjectRepository(XPEvent) private xpEventRepo: Repository<XPEvent>,
    @InjectRepository(XPPeriod) private xpPeriodRepo: Repository<XPPeriod>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  @OnEvent('piece.delivered')
  async handle(payload: { pieceId: string }) {
    const piece = await this.pieceRepo.findOne({ where: { id: payload.pieceId } });
    if (!piece) return;

    const latestVersion = await this.versionRepo.findOne({
      where: { pieceId: piece.id },
      order: { versionNumber: 'DESC' },
    });

    if (latestVersion) {
      const client = await this.clientRepo.findOne({ where: { id: piece.clientId } });
      const clientCode = client?.name?.substring(0, 10).toUpperCase().replace(/\s+/g, '_') ?? '';
      const isValid = /^[A-Z0-9]+_[A-Z-]+_[A-Z0-9-]+_v\d+_(FINAL|BORRADOR|REVISION)$/i.test(latestVersion.fileName);
      if (!isValid) {
        latestVersion.namingValid = false;
        latestVersion.namingErrors = ['El nombre del archivo no sigue la convención establecida'];
      } else {
        latestVersion.namingValid = true;
        latestVersion.namingErrors = [];
      }
      await this.versionRepo.save(latestVersion);
    }

    if (piece.assignedTo) {
      await this.registerXp(piece);
    }

    const client = await this.clientRepo.findOne({ where: { id: piece.clientId } });
    if (client?.communityManagerId) {
      const notif = this.notifRepo.create({
        userId: client.communityManagerId,
        type: 'piece.delivered',
        title: 'Pieza entregada',
        message: `La pieza "${piece.title}" ha sido entregada al cliente.`,
        data: { pieceId: piece.id, clientId: piece.clientId },
      });
      await this.notifRepo.save(notif);
    }
  }

  private async registerXp(piece: Piece) {
    const period = await this.ensurePeriod(piece.assignedTo!, piece.deliveredAt ?? new Date());
    const level = piece.difficultyLevel ?? 1;
    const expectedHours = EXPECTED_HOURS[level] ?? 3;
    const elapsedHours = Math.abs(
      (piece.deliveredAt?.getTime() ?? Date.now()) - piece.createdAt.getTime(),
    ) / 3_600_000;

    const namingValid = await this.versionRepo.findOne({
      where: { pieceId: piece.id, namingValid: true },
    });

    const points = calculateDeliveryXp({
      difficultyLevel: level,
      actualHours: elapsedHours,
      expectedHours,
      perfectNaming: !!namingValid,
      hadDesignerErrorCorrection: (piece.correctionCount ?? 0) > 0,
    });

    const event = this.xpEventRepo.create({
      xpPeriodId: period.id,
      userId: piece.assignedTo,
      pieceId: piece.id,
      eventType: XPEventType.BASE_DELIVERY,
      points,
      description: `Entrega de ${piece.title} (N${level})`,
      metadata: {
        elapsed_hours: Math.round(elapsedHours * 100) / 100,
        expected_hours: expectedHours,
        perfect_naming: !!namingValid,
      },
    });
    await this.xpEventRepo.save(event);
    await this.recalculatePeriod(period);
  }

  private async ensurePeriod(userId: string, date: Date) {
    const start = this.startOfWeek(date);
    let period = await this.xpPeriodRepo.findOne({ where: { userId, weekStart: start } });
    if (!period) {
      period = this.xpPeriodRepo.create({
        userId,
        weekStart: start,
        weekEnd: this.endOfWeek(date),
        status: 'open',
        totalXp: 0,
      });
      period = await this.xpPeriodRepo.save(period);
    }
    return period;
  }

  private async recalculatePeriod(period: XPPeriod) {
    const result = await this.xpEventRepo
      .createQueryBuilder('e')
      .select('COALESCE(SUM(e.points), 0)', 'total')
      .where('e.xp_period_id = :periodId', { periodId: period.id })
      .getRawOne();
    const total = Number(result?.total ?? 0);
    await this.xpPeriodRepo.update(period.id, { totalXp: total });
  }

  private startOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private endOfWeek(date: Date): Date {
    const d = this.startOfWeek(date);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  }
}
