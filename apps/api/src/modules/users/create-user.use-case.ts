import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
const BCRYPT_ROUNDS = 10;

@Injectable()
export class CreateUserUseCase {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
  ) {}

  async execute(data: { email: string; password: string; name: string; organizationId: string; role?: string; phone?: string }) {
    const hashed = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    const user = this.repo.create({
      email: data.email,
      password: hashed,
      name: data.name,
      organizationId: data.organizationId,
      role: (data.role as any) || 'designer',
      phone: data.phone,
    });
    return this.repo.save(user);
  }
}
