import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Piece } from '../../../modules/production/piece.entity';
import { PieceStatus } from '../../../modules/production/piece-status.enum';
import { Notification } from '../../notifications/notification.entity';

const STALE_HOURS = 48;
const ACTIVE_STATUSES = [
  PieceStatus.ASSIGNED,
  PieceStatus.IN_PROGRESS,
  PieceStatus.INTERNAL_REVIEW,
  PieceStatus.CLIENT_VALIDATION,
  PieceStatus.CORRECTION,
];

@Injectable()
export class DetectStalePiecesJob {
  private readonly logger = new Logger(DetectStalePiecesJob.name);

  constructor(
    @InjectRepository(Piece) private pieceRepo: Repository<Piece>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  async handle(): Promise<void> {
    this.logger.log('Detecting stale pieces...');
    const cutoff = new Date(Date.now() - STALE_HOURS * 3_600_000);

    const stalePieces = await this.pieceRepo
      .createQueryBuilder('p')
      .where('p.status IN (:...statuses)', { statuses: ACTIVE_STATUSES })
      .andWhere('p.updated_at < :cutoff', { cutoff })
      .andWhere('(p.stale_alerted_at IS NULL OR p.stale_alerted_at < :cutoff)', { cutoff })
      .getMany();

    for (const piece of stalePieces) {
      piece.staleAlertedAt = new Date();
      await this.pieceRepo.save(piece);

      const notif = this.notifRepo.create({
        userId: piece.assignedTo ?? '',
        type: 'piece.stale',
        title: 'Pieza estancada',
        message: `La pieza "${piece.title}" lleva más de ${STALE_HOURS}h en estado "${piece.status}".`,
        data: { pieceId: piece.id, status: piece.status, hoursStale: STALE_HOURS },
      });
      await this.notifRepo.save(notif);

      this.logger.warn(`Stale piece: ${piece.id} - ${piece.title} (${piece.status})`);
    }

    this.logger.log(`Found ${stalePieces.length} stale pieces`);
  }
}
