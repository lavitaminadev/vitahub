import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { UDBudget } from './ud-budget.entity';
import { UDMovement } from './ud-movement.entity';
import { UDMovementType } from './ud-movement-type.enum';

@Injectable()
export class ReserveUdUseCase {
  constructor(
    @InjectRepository(UDBudget) private budgetRepo: Repository<UDBudget>,
    @InjectRepository(UDMovement) private movementRepo: Repository<UDMovement>,
  ) {}

  async execute(clientId: string, pieceId: string, amount: number, year: number, month: number) {
    return this.budgetRepo.manager.transaction(async (manager: EntityManager) => {
      const budget = await manager.findOne(UDBudget, { where: { clientId, year, month } });
      if (!budget) throw new Error('Presupuesto UD no encontrado. Cree el presupuesto primero.');

      const available = budget.contracted - budget.reserved - budget.consumed;
      if (amount > available) throw new Error(`UD insuficientes. Disponibles: ${available}, requeridas: ${amount}`);

      budget.reserved = Number(budget.reserved) + amount;
      await manager.save(UDBudget, budget);

      const movement = manager.create(UDMovement, {
        udBudgetId: budget.id,
        pieceId,
        type: UDMovementType.RESERVATION,
        amount,
      });
      await manager.save(UDMovement, movement);

      return budget;
    });
  }
}
