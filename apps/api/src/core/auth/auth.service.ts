import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../modules/users/user.entity';
import { Organization } from '../../modules/organizations/organization.entity';
import { UserRole } from '../../modules/organizations/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Organization) private orgRepo: Repository<Organization>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { email, isActive: true },
      select: ['id', 'email', 'name', 'password', 'role', 'organizationId', 'avatarUrl'],
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(user: any): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: user.id, email: user.email, role: user.role, organizationId: user.organizationId };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    await this.userRepo.update(user.id, { refreshToken });
    return { accessToken, refreshToken };
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepo.findOne({
        where: { id: payload.sub, isActive: true },
        select: ['id', 'refreshToken', 'email', 'role', 'organizationId'],
      });
      if (!user || user.refreshToken !== token) throw new UnauthorizedException();
      const newPayload = { sub: user.id, email: user.email, role: user.role, organizationId: user.organizationId };
      const accessToken = this.jwtService.sign(newPayload);
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(data: { email: string; password: string; name: string; organizationId?: string }) {
    const existing = await this.userRepo.findOne({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already registered');

    let organizationId = data.organizationId;
    if (!organizationId) {
      const code = data.email.split('@')[0] + '-' + Date.now().toString(36);
      const org = await this.orgRepo.save(
        this.orgRepo.create({ name: `${data.name}'s Organization`, code }),
      );
      organizationId = org.id;
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
    const hashed = await bcrypt.hash(data.password, rounds);
    const user = this.userRepo.create({
      email: data.email, password: hashed, name: data.name, organizationId, role: UserRole.DESIGNER,
    });
    const saved = await this.userRepo.save(user);
    const payload = { sub: saved.id, email: saved.email, role: saved.role, organizationId: saved.organizationId };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    await this.userRepo.update(saved.id, { refreshToken });
    return {
      accessToken,
      refreshToken,
      user: { id: saved.id, name: saved.name, email: saved.email, role: saved.role },
    };
  }

  async me(userId: string) {
    return this.userRepo.findOne({ where: { id: userId } });
  }

  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    await this.userRepo.update(userId, data);
    return this.userRepo.findOne({ where: { id: userId } });
  }
}
