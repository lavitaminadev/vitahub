import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Client } from '../clients/client.entity';
import { UserRole } from '../organizations/user-role.enum';

interface UpdateUserInput {
  id: string;
  organizationId: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  clientId?: string | null;
  isActive?: boolean;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Client) private readonly clientsRepo: Repository<Client>,
  ) {}

  async execute(data: UpdateUserInput): Promise<User | null> {
    const user = await this.usersRepo.findOne({ where: { id: data.id, organizationId: data.organizationId } });
    if (!user) return null;

    if (typeof data.name === 'string') user.name = data.name.trim();
    if (typeof data.email === 'string') user.email = data.email.trim().toLowerCase();
    if (typeof data.phone === 'string') user.phone = data.phone.replace(/[^\d+]/g, '') || undefined;
    if (typeof data.isActive === 'boolean') user.isActive = data.isActive;
    if (data.role) user.role = data.role;

    if (data.clientId === null || data.clientId === '') {
      user.clientId = undefined;
    } else if (data.clientId) {
      const client = await this.clientsRepo.findOne({ where: { id: data.clientId, organizationId: data.organizationId } });
      user.clientId = client?.id;
    }

    if (user.role !== UserRole.CLIENT) {
      user.clientId = undefined;
    }

    return this.usersRepo.save(user);
  }
}
