import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import type { AuthResponse, UserRole as SharedUserRole } from '@vitahub/shared';
import { User } from '../../modules/users/user.entity';
import { Organization } from '../../modules/organizations/organization.entity';
import { UserRole } from '../../modules/organizations/user-role.enum';

/**
 * Casts the internal TypeORM enum to the shared string-literal union.
 *
 * Runtime values are identical; this helper satisfies the compiler without
 * weakening type safety.
 */
function toSharedRole(role: UserRole): SharedUserRole {
  return role as unknown as SharedUserRole;
}

/**
 * Token payload embedded in JWT access/refresh tokens.
 */
interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  organizationId: string;
  clientId?: string;
}

/**
 * Authentication business logic: password validation, token issuance,
 * registration, and profile lookup.
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Organization) private readonly orgRepo: Repository<Organization>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates an email/password pair and returns the user if valid.
   *
   * @param email - User email.
   * @param password - Plain-text password.
   * @returns The authenticated user entity.
   * @throws UnauthorizedException when credentials are invalid.
   */
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { email, isActive: true },
      select: ['id', 'email', 'name', 'password', 'role', 'organizationId', 'avatarUrl', 'clientId'],
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  /**
   * Issues access and refresh tokens for an authenticated user.
   *
   * @param user - Authenticated user entity.
   * @returns Tokens plus the user summary.
   */
  async login(user: User): Promise<AuthResponse> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      clientId: user.clientId,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    await this.userRepo.update(user.id, { refreshToken });
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: toSharedRole(user.role),
        organizationId: user.organizationId,
        clientId: user.clientId,
      },
    };
  }

  /**
   * Refreshes an access token from a valid refresh token.
   *
   * @param token - Refresh token.
   * @returns New access token.
   * @throws UnauthorizedException when the refresh token is invalid or revoked.
   */
  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify<TokenPayload>(token);
      const user = await this.userRepo.findOne({
        where: { id: payload.sub, isActive: true },
        select: ['id', 'refreshToken', 'email', 'role', 'organizationId', 'clientId'],
      });
      if (!user || user.refreshToken !== token) throw new UnauthorizedException();
      const newPayload: TokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        clientId: user.clientId,
      };
      const accessToken = this.jwtService.sign(newPayload);
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Registers a new user and creates an organization if none is provided.
   *
   * @param data - Registration data.
   * @returns Newly created tokens and user summary.
   */
  async register(data: { email: string; password: string; name: string; organizationId?: string }): Promise<AuthResponse> {
    const existing = await this.userRepo.findOne({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already registered');

    let organizationId = data.organizationId;
    if (!organizationId) {
      const code = `${data.email.split('@')[0]}-${Date.now().toString(36)}`;
      const org = await this.orgRepo.save(
        this.orgRepo.create({ name: `${data.name}'s Organization`, code }),
      );
      organizationId = org.id;
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
    const hashed = await bcrypt.hash(data.password, rounds);
    const user = this.userRepo.create({
      email: data.email,
      password: hashed,
      name: data.name,
      organizationId,
      role: UserRole.DESIGNER,
    });
    const saved = await this.userRepo.save(user);
    const payload: TokenPayload = {
      sub: saved.id,
      email: saved.email,
      role: saved.role,
      organizationId: saved.organizationId,
      clientId: saved.clientId,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    await this.userRepo.update(saved.id, { refreshToken });
    return {
      accessToken,
      refreshToken,
      user: {
        id: saved.id,
        name: saved.name,
        email: saved.email,
        role: toSharedRole(saved.role),
        organizationId: saved.organizationId,
        clientId: saved.clientId,
      },
    };
  }

  /**
   * Returns the user profile by id.
   *
   * @param userId - User identifier.
   * @returns User entity or null.
   */
  async me(userId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id: userId } });
  }

  /**
   * Updates the profile of the authenticated user.
   *
   * @param userId - User identifier.
   * @param data - Profile fields to update.
   * @returns Updated user entity.
   */
  async updateProfile(userId: string, data: { name?: string; email?: string }): Promise<User | null> {
    await this.userRepo.update(userId, data);
    return this.userRepo.findOne({ where: { id: userId } });
  }
}
