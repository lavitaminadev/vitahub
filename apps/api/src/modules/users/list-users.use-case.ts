import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from '../organizations/user-role.enum';

interface ListUsersFilters {
  organizationId: string;
  role?: UserRole;
  clientId?: string;
  isActive?: boolean;
  q?: string;
}

/**
 * Lists users filtered by organization.
 */
@Injectable()
export class ListUsersUseCase {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  /**
   * Returns users for the given organization, sorted by name.
   *
   * @param filters - Scoped list filters.
   * @returns List of user entities.
   */
  async execute(filters: ListUsersFilters): Promise<User[]> {
    const where: FindOptionsWhere<User> = {
      organizationId: filters.organizationId,
    };

    if (filters.role) where.role = filters.role;
    if (filters.clientId) where.clientId = filters.clientId;
    if (typeof filters.isActive === 'boolean') where.isActive = filters.isActive;

    const users = await this.repo.find({
      where,
      order: { name: 'ASC' },
      relations: ['organization'],
    });

    const q = filters.q?.trim().toLowerCase();
    if (!q) return users;

    return users.filter((user) =>
      [user.name, user.email, user.phone, user.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }
}
