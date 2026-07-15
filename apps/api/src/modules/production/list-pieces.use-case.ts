import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Piece } from './piece.entity';
import { PieceStatus } from './piece-status.enum';

@Injectable()
export class ListPiecesUseCase {
  constructor(
    @InjectRepository(Piece) private repo: Repository<Piece>,
  ) {}

  async execute(organizationId: string, status?: PieceStatus, clientId?: string, assignedTo?: string) {
    const where: any = { organizationId };
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (assignedTo) where.assignedTo = assignedTo;
    return this.repo.find({ where, order: { createdAt: 'DESC' }, relations: ['client'] });
  }
}
