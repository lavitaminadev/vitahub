import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { UDBudget } from './ud-budget.entity';
import { UDMovement } from './ud-movement.entity';
import { UDMovementType } from './ud-movement-type.enum';

@Injectable()
export class ConfirmUdConsumptionUseCase {
  constructor(
    @InjectRepository(UDBudget) private budgetRepo: Repository<UDBudget>,
    @InjectRepository(UDMovement) private movementRepo: Repository<UDMovement>,
  ) {}

  async execute(clientId: string, pieceId: string, year: number, month: number) {
    return this.budgetRepo.manager.transaction(async (manager: EntityManager) => {
      const budget = await manager.findOne(UDBudget, { where: { clientId, year, month } });
      if (!budget) throw new Error('Presupuesto UD no encontrado.');

      const pending = Number(budget.reserved);
      if (pending <= 0) throw new Error('No hay UD reservadas para confirmar.');

      budget.reserved = 0;
      budget.consumed = Number(budget.consumed) + pending;
      await manager.save(UDBudget, budget);

      const movement = manager.create(UDMovement, {
        udBudgetId: budget.id,
        pieceId,
        type: UDMovementType.CONSUMPTION,
        amount: pending,
      });
      await manager.save(UDMovement, movement);

      return budget;
    });
  }
}
