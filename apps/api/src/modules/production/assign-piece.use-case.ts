import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Piece } from './piece.entity';
import { PieceStatus } from './piece-status.enum';
import { calculatePieceUd } from '../design-budget/ud-calculator';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AssignPieceUseCase {
  constructor(
    @InjectRepository(Piece) private repo: Repository<Piece>,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(pieceId: string, designerId: string, organizationId: string) {
    return this.repo.manager.transaction(async (manager: EntityManager) => {
      const piece = await manager.findOne(Piece, { where: { id: pieceId, organizationId } });
      if (!piece) throw new NotFoundException('Pieza no encontrada');

      piece.assignedTo = designerId;
      piece.status = PieceStatus.ASSIGNED;

      const saved = await manager.save(Piece, piece);
      this.eventEmitter.emit('piece.assigned', { pieceId: saved.id, designerId });
      return saved;
    });
  }
}
