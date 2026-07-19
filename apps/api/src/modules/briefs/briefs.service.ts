import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brief } from './brief.entity';
import { CreateBriefDto } from './dto/create-brief.dto';
import { UpdateBriefDto } from './dto/update-brief.dto';

/**
 * Business logic for briefs (client requirements documents).
 */
@Injectable()
export class BriefsService {
  constructor(
    @InjectRepository(Brief) private readonly repo: Repository<Brief>,
  ) {}

  /**
   * Creates a brief scoped to an organization.
   *
   * @param dto - Brief creation data.
   * @param organizationId - Tenant id.
   * @returns Saved brief entity.
   */
  async create(dto: CreateBriefDto, organizationId: string): Promise<Brief> {
    const brief = this.repo.create({ ...dto, organizationId });
    return this.repo.save(brief);
  }

  /**
   * Returns paginated briefs for the organization.
   *
   * @param organizationId - Tenant id.
   * @param limit - Page size.
   * @param offset - Items to skip.
   * @returns Paginated brief list.
   */
  async findAll(organizationId: string, limit = 50, offset = 0): Promise<{ data: Brief[]; total: number; limit: number; offset: number }> {
    const [data, total] = await this.repo.findAndCount({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { data, total, limit, offset };
  }

  /**
   * Finds a brief by id and tenant.
   *
   * @param id - Brief identifier.
   * @param organizationId - Tenant id.
   * @returns Brief entity.
   * @throws NotFoundException if not found.
   */
  async findOne(id: string, organizationId: string): Promise<Brief> {
    const brief = await this.repo.findOne({ where: { id, organizationId } });
    if (!brief) throw new NotFoundException('Brief not found');
    return brief;
  }

  /**
   * Updates a brief.
   *
   * @param id - Brief identifier.
   * @param dto - Fields to update.
   * @param organizationId - Tenant id.
   * @returns Updated brief entity.
   */
  async update(id: string, dto: UpdateBriefDto, organizationId: string): Promise<Brief> {
    const brief = await this.findOne(id, organizationId);
    Object.assign(brief, dto);
    return this.repo.save(brief);
  }

  /**
   * Removes a brief.
   *
   * @param id - Brief identifier.
   * @param organizationId - Tenant id.
   * @returns Removed brief entity.
   */
  async remove(id: string, organizationId: string): Promise<Brief> {
    const brief = await this.findOne(id, organizationId);
    return this.repo.remove(brief);
  }
}
