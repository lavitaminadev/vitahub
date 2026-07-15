import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Piece } from './piece.entity';
import { PieceVersion } from './piece-version.entity';
import { Correction } from './correction.entity';
import { PieceStatus } from './piece-status.enum';
import { CorrectionOrigin } from './correction-origin.enum';
import { DesignBudgetService } from '../design-budget/design-budget.service';
import { XPService } from '../gamification/xp.service';

@Injectable()
export class ProductionWorkflowService {
  constructor(
    @InjectRepository(Piece) private pieceRepo: Repository<Piece>,
    @InjectRepository(PieceVersion) private versionRepo: Repository<PieceVersion>,
    @InjectRepository(Correction) private correctionRepo: Repository<Correction>,
    private designBudget: DesignBudgetService,
    private xp: XPService,
  ) {}

  async assign(
    piece: Piece,
    designerId: string,
    pieceType: string,
    difficultyLevel: number,
    carouselSlides = 0,
    actorId?: string,
  ): Promise<void> {
    await this.pieceRepo.manager.transaction(async (manager) => {
      const udAmount = this.designBudget.calculateForPiece(pieceType, carouselSlides);

      piece.assignedTo = designerId;
      piece.type = pieceType as any;
      piece.difficultyLevel = difficultyLevel;
      piece.udAmount = udAmount;
      piece.status = PieceStatus.ASSIGNED;

      await manager.save(Piece, piece);
      await this.designBudget.reserveForPiece(piece, actorId);
    });
  }

  async submitVersion(piece: Piece, fileName: string, driveFileId: string | undefined, userId: string): Promise<PieceVersion> {
    const maxResult = await this.versionRepo.findOne({
      where: { pieceId: piece.id },
      order: { versionNumber: 'DESC' },
    });
    const nextVersion = (maxResult?.versionNumber ?? 0) + 1;

    const version = this.versionRepo.create({
      pieceId: piece.id,
      versionNumber: nextVersion,
      fileName,
      driveFileId,
      createdBy: userId,
    });
    const saved = await this.versionRepo.save(version);

    piece.status = PieceStatus.INTERNAL_REVIEW;
    await this.pieceRepo.save(piece);

    return saved;
  }

  async rejectByClient(piece: Piece, version: PieceVersion, comment: string, clientUserId: string): Promise<void> {
    await this.pieceRepo.manager.transaction(async (manager) => {
      piece.clientCorrectionCount = (piece.clientCorrectionCount ?? 0) + 1;
      piece.correctionCount = (piece.correctionCount ?? 0) + 1;

      const correction = manager.create(Correction, {
        pieceId: piece.id,
        pieceVersionId: version.id,
        origin: CorrectionOrigin.CLIENT_REQUEST,
        description: comment,
        requestedBy: clientUserId,
      });
      await manager.save(Correction, correction);

      piece.status = PieceStatus.CORRECTION;
      await manager.save(Piece, piece);
    });
  }

  async deliver(piece: Piece, actorId?: string): Promise<void> {
    await this.pieceRepo.manager.transaction(async (manager) => {
      piece.status = PieceStatus.DELIVERED;
      piece.deliveredAt = new Date();
      await manager.save(Piece, piece);

      const freshPiece = await manager.findOne(Piece, { where: { id: piece.id } });

      await this.designBudget.confirmConsumption(piece, actorId);

      if (freshPiece?.assignedTo) {
        await this.xp.registerDelivery(freshPiece, freshPiece.assignedTo, new Date());
      }
    });
  }

  async flagDesignerError(piece: Piece, version: PieceVersion, description: string, artDirectorId: string): Promise<void> {
    await this.pieceRepo.manager.transaction(async (manager) => {
      piece.correctionCount = (piece.correctionCount ?? 0) + 1;

      const correction = manager.create(Correction, {
        pieceId: piece.id,
        pieceVersionId: version.id,
        origin: CorrectionOrigin.DESIGNER_ERROR,
        description,
        requestedBy: artDirectorId,
      });
      await manager.save(Correction, correction);

      if (piece.assignedTo) {
        await this.xp.registerDesignerErrorPenalty(piece, piece.assignedTo);
      }
    });
  }
}
