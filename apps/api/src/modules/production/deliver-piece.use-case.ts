import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Piece } from './piece.entity';
import { PieceStatus } from './piece-status.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DeliverPieceUseCase {
  constructor(
    @InjectRepository(Piece) private repo: Repository<Piece>,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(pieceId: string, organizationId: string) {
    return this.repo.manager.transaction(async (manager: EntityManager) => {
      const piece = await manager.findOne(Piece, { where: { id: pieceId, organizationId } });
      if (!piece) throw new NotFoundException('Pieza no encontrada');

      piece.status = PieceStatus.DELIVERED;
      piece.deliveredAt = new Date();
      const saved = await manager.save(Piece, piece);

      this.eventEmitter.emit('piece.delivered', { pieceId: saved.id });
      return saved;
    });
  }
}
