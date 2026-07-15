import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Piece } from '../../../modules/production/piece.entity';
import { Client } from '../../../modules/clients/client.entity';
import { UDBudget } from '../../../modules/design-budget/ud-budget.entity';
import { UDMovement } from '../../../modules/design-budget/ud-movement.entity';
import { UDMovementType } from '../../../modules/design-budget/ud-movement-type.enum';
import { Notification } from '../../notifications/notification.entity';

@Injectable()
export class PieceAssignedHandler {
  constructor(
    @InjectRepository(Piece) private pieceRepo: Repository<Piece>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    @InjectRepository(UDBudget) private budgetRepo: Repository<UDBudget>,
    @InjectRepository(UDMovement) private movementRepo: Repository<UDMovement>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  @OnEvent('piece.assigned')
  async handle(payload: { pieceId: string; designerId: string }) {
    const piece = await this.pieceRepo.findOne({ where: { id: payload.pieceId } });
    if (!piece) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const budget = await this.budgetRepo.findOne({
      where: { clientId: piece.clientId, year, month },
    });

    if (budget) {
      const amount = Number(piece.udAmount);
      const available = Number(budget.contracted) - Number(budget.reserved) - Number(budget.consumed);
      if (amount <= available) {
        budget.reserved = Number(budget.reserved) + amount;
        await this.budgetRepo.save(budget);

        const movement = this.movementRepo.create({
          udBudgetId: budget.id,
          pieceId: piece.id,
          type: UDMovementType.RESERVATION,
          amount,
          actorId: payload.designerId,
        });
        await this.movementRepo.save(movement);
      }
    }

    const notif = this.notifRepo.create({
      userId: payload.designerId,
      type: 'piece.assigned',
      title: 'Nueva pieza asignada',
      message: `Se te ha asignado la pieza "${piece.title}".`,
      data: { pieceId: piece.id, clientId: piece.clientId },
    });
    await this.notifRepo.save(notif);
  }
}
