import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UDBudget } from './ud-budget.entity';
import { UDMovementType } from './ud-movement-type.enum';

@Injectable()
export class GetOrCreateBudgetUseCase {
  constructor(
    @InjectRepository(UDBudget) private repo: Repository<UDBudget>,
  ) {}

  async execute(clientId: string, year: number, month: number, defaultBudget = 20) {
    const existing = await this.repo.findOne({ where: { clientId, year, month } });
    if (existing) return existing;

    const budget = this.repo.create({
      clientId, year, month,
      contracted: defaultBudget,
    });
    return this.repo.save(budget);
  }
}
