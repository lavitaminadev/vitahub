import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

/**
 * Business logic for client contracts.
 */
@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract) private readonly repo: Repository<Contract>,
  ) {}

  async create(dto: CreateContractDto, organizationId: string): Promise<Contract> {
    const contract = this.repo.create({ ...dto, organizationId });
    return this.repo.save(contract);
  }

  async findAll(organizationId: string, limit = 50, offset = 0): Promise<{ data: Contract[]; total: number; limit: number; offset: number }> {
    const [data, total] = await this.repo.findAndCount({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { data, total, limit, offset };
  }

  async findOne(id: string, organizationId: string): Promise<Contract> {
    const contract = await this.repo.findOne({ where: { id, organizationId } });
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }

  async update(id: string, dto: UpdateContractDto, organizationId: string): Promise<Contract> {
    const contract = await this.findOne(id, organizationId);
    Object.assign(contract, dto);
    return this.repo.save(contract);
  }

  async remove(id: string, organizationId: string): Promise<Contract> {
    const contract = await this.findOne(id, organizationId);
    return this.repo.remove(contract);
  }
}
