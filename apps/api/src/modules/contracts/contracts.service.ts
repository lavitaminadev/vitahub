import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './contract.entity';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract) private repo: Repository<Contract>,
  ) {}

  async create(dto: any, organizationId: string) {
    const contract = this.repo.create({ ...dto, organizationId });
    return this.repo.save(contract);
  }

  async findAll(organizationId: string) {
    return this.repo.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const contract = await this.repo.findOne({ where: { id, organizationId } });
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }

  async update(id: string, dto: any, organizationId: string) {
    const contract = await this.findOne(id, organizationId);
    Object.assign(contract, dto);
    return this.repo.save(contract);
  }

  async remove(id: string, organizationId: string) {
    const contract = await this.findOne(id, organizationId);
    return this.repo.remove(contract);
  }
}
