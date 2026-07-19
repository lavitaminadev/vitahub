import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UDBudget } from './ud-budget.entity';
import { UDMovement } from './ud-movement.entity';
import { UDMovementType } from './ud-movement-type.enum';
import { Piece } from '../production/piece.entity';
import { Client } from '../clients/client.entity';
import { ParameterResolver } from '../../core/parameters/parameter-resolver.service';
import { calculatePieceUd } from './ud-calculator';
import { BudgetAlertDto } from './dto/budget-alert.dto';

@Injectable()
export class DesignBudgetService {
  constructor(
    @InjectRepository(UDBudget) private budgetRepo: Repository<UDBudget>,
    @InjectRepository(UDMovement) private movementRepo: Repository<UDMovement>,
    private parameterResolver: ParameterResolver,
  ) {}

  async ensureMonthlyBudget(clientId: string, year: number, month: number): Promise<UDBudget> {
    const existing = await this.budgetRepo.findOne({ where: { clientId, year, month } });
    if (existing) return existing;

    const contracted = await this.resolveMonthlyBudget(clientId);
    const budget = this.budgetRepo.create({
      clientId, year, month,
      contracted,
      reserved: 0,
      consumed: 0,
      status: 'open',
    });
    return this.budgetRepo.save(budget);
  }

  calculateForPiece(pieceType: string, carouselSlides = 0): number {
    return calculatePieceUd(pieceType, carouselSlides);
  }

  async reserveForPiece(piece: Piece, actorId?: string): Promise<UDMovement> {
    return this.budgetRepo.manager.transaction(async (manager) => {
      const date = piece.createdAt;
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const budget = await this.ensureMonthlyBudget(piece.clientId, year, month);
      const amount = piece.udAmount;

      const used = Number(budget.reserved) + Number(budget.consumed);
      const available = Number(budget.contracted) - used;
      if (amount > available) {
        throw new Error(`UD insuficientes. Disponibles: ${available}, requeridas: ${amount}`);
      }

      budget.reserved = Number(budget.reserved) + amount;
      await manager.save(UDBudget, budget);

      const movement = manager.create(UDMovement, {
        udBudgetId: budget.id,
        pieceId: piece.id,
        type: UDMovementType.RESERVATION,
        amount,
        reason: `Reserva por asignación de pieza ${piece.title}`,
        actorId,
      });
      return manager.save(UDMovement, movement);
    });
  }

  async confirmConsumption(piece: Piece, actorId?: string): Promise<UDMovement> {
    return this.budgetRepo.manager.transaction(async (manager) => {
      const date = piece.deliveredAt ?? new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const budget = await this.ensureMonthlyBudget(piece.clientId, year, month);
      const amount = piece.udAmount;

      if (amount > Number(budget.reserved)) {
        throw new Error(`UD reservadas insuficientes para confirmar. Reservadas: ${budget.reserved}, a consumir: ${amount}`);
      }

      budget.reserved = Number(budget.reserved) - amount;
      budget.consumed = Number(budget.consumed) + amount;
      await manager.save(UDBudget, budget);

      const movement = manager.create(UDMovement, {
        udBudgetId: budget.id,
        pieceId: piece.id,
        type: UDMovementType.CONSUMPTION,
        amount,
        reason: `Consumo confirmado por entrega de pieza ${piece.title}`,
        actorId,
      });
      return manager.save(UDMovement, movement);
    });
  }

  async isNearLimit(budget: UDBudget, thresholdPercent?: number): Promise<boolean> {
    const threshold = thresholdPercent ?? (await this.parameterResolver.get('ud.warning_threshold_percent', budget.clientId)) ?? 80;
    const used = Number(budget.reserved) + Number(budget.consumed);
    const total = Number(budget.contracted);

    if (total <= 0) return false;

    return (used / total) >= (threshold / 100);
  }

  async checkBudgetAlert(clientId: string, clientName?: string): Promise<BudgetAlertDto> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const budget = await this.ensureMonthlyBudget(clientId, year, month);

    const used = Number(budget.reserved) + Number(budget.consumed);
    const total = Number(budget.contracted);
    const percentage = total > 0 ? Math.round((used / total) * 100) : 0;

    let status: BudgetAlertDto['status'] = 'ok';
    if (used >= total) {
      status = 'blocked';
    } else if (percentage >= 80) {
      status = 'warning';
    }

    return { clientId, clientName, used, total, percentage, status };
  }

  private async resolveMonthlyBudget(clientId: string): Promise<number> {
    const fromParam = await this.parameterResolver.get('ud.default_monthly_budget', clientId);
    return Number(fromParam ?? 20);
  }
}
