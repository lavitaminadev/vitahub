import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Piece } from './piece.entity';
import { PieceVersion } from './piece-version.entity';
import { Correction } from './correction.entity';
import { PieceStatus } from './piece-status.enum';
import { CorrectionOrigin } from './correction-origin.enum';
import { PieceRulesService } from './piece-rules.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class RejectPieceUseCase {
  constructor(
    @InjectRepository(Piece) private pieceRepo: Repository<Piece>,
    @InjectRepository(Correction) private correctionRepo: Repository<Correction>,
    private pieceRules: PieceRulesService,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(pieceId: string, data: { versionId?: string; comment: string; origin: CorrectionOrigin; userId: string }) {
    return this.pieceRepo.manager.transaction(async (manager: EntityManager) => {
      const piece = await manager.findOne(Piece, { where: { id: pieceId } });
      if (!piece) throw new NotFoundException('Pieza no encontrada');

      const isDesignerError = data.origin === CorrectionOrigin.DESIGNER_ERROR;
      const currentCount = data.origin === CorrectionOrigin.CLIENT_REQUEST ? piece.clientCorrectionCount : piece.correctionCount;
      const { allowed, reason } = this.pieceRules.canRequestCorrection(currentCount, isDesignerError);
      if (!allowed) throw new BadRequestException(reason);

      piece.correctionCount += 1;
      if (data.origin === CorrectionOrigin.CLIENT_REQUEST) {
        piece.clientCorrectionCount += 1;
      }
      piece.status = PieceStatus.CORRECTION;
      await manager.save(Piece, piece);

      const shouldGenerateChargeNote = data.origin === CorrectionOrigin.CLIENT_REQUEST
        && this.pieceRules.shouldGenerateInvoice(piece.clientCorrectionCount);

      const correction = manager.create(Correction, {
        pieceId,
        pieceVersionId: data.versionId,
        origin: data.origin,
        description: data.comment,
        requestedBy: data.userId,
        billableExtra: shouldGenerateChargeNote,
        chargeNoteRequired: shouldGenerateChargeNote,
      });
      const saved = await manager.save(Correction, correction);

      this.eventEmitter.emit('piece.rejected', { pieceId, correctionId: saved.id, origin: data.origin });
      return saved;
    });
  }
}
