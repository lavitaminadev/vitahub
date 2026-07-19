import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './organization.entity';

/**
 * Lists all organizations sorted by name.
 */
@Injectable()
export class ListOrganizationsUseCase {
  constructor(
    @InjectRepository(Organization) private readonly repo: Repository<Organization>,
  ) {}

  /**
   * Returns every organization in the database.
   *
   * @returns List of organization entities.
   */
  async execute(organizationId?: string): Promise<Organization[]> {
    return this.repo.find({
      where: organizationId ? { id: organizationId } : undefined,
      order: { name: 'ASC' },
    });
  }
}
