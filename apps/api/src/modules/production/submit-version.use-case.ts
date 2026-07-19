import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Piece } from './piece.entity';
import { PieceVersion } from './piece-version.entity';
import { PieceStatus } from './piece-status.enum';
import { validate, extractState } from './naming-validator';

@Injectable()
export class SubmitVersionUseCase {
  constructor(
    @InjectRepository(Piece) private pieceRepo: Repository<Piece>,
    @InjectRepository(PieceVersion) private versionRepo: Repository<PieceVersion>,
  ) {}

  async execute(pieceId: string, data: { fileName: string; driveFileId?: string; userId: string }) {
    const piece = await this.pieceRepo.findOne({ where: { id: pieceId }, relations: ['client'] });
    if (!piece) throw new NotFoundException('Pieza no encontrada');

    const versions = await this.versionRepo.find({ where: { pieceId }, order: { versionNumber: 'DESC' }, take: 1 });
    const nextVersion = (versions[0]?.versionNumber ?? 0) + 1;

    const clientCode = piece?.client?.name?.substring(0, 4).toUpperCase() || '';
    const namingResult = validate(data.fileName, clientCode);
    const state = extractState(data.fileName);

    const version = this.versionRepo.create({
      pieceId,
      versionNumber: nextVersion,
      fileName: data.fileName,
      driveFileId: data.driveFileId,
      createdBy: data.userId,
      namingValid: namingResult.isValid,
      namingErrors: namingResult.errors.length > 0 ? namingResult.errors : undefined,
      stateLabel: state ?? undefined,
      isFinal: state === 'FINAL',
    });

    piece.status = PieceStatus.INTERNAL_REVIEW;
    await this.pieceRepo.save(piece);
    return this.versionRepo.save(version);
  }
}
