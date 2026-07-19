import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Moodboard } from './moodboard.entity';
import { Session } from './session.entity';
import { CreateMoodboardDto } from './dto/create-moodboard.dto';
import { UpdateMoodboardDto } from './dto/update-moodboard.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

/**
 * Business logic for audiovisual moodboards and sessions.
 */
@Injectable()
export class AudiovisualService {
  constructor(
    @InjectRepository(Moodboard) private readonly moodboardRepo: Repository<Moodboard>,
    @InjectRepository(Session) private readonly sessionRepo: Repository<Session>,
  ) {}

  // Moodboard CRUD
  async createMoodboard(dto: CreateMoodboardDto, organizationId: string): Promise<Moodboard> {
    const entity = this.moodboardRepo.create({ ...dto, organizationId });
    return this.moodboardRepo.save(entity);
  }

  async findAllMoodboards(organizationId: string, limit = 50, offset = 0): Promise<{ data: Moodboard[]; total: number; limit: number; offset: number }> {
    const [data, total] = await this.moodboardRepo.findAndCount({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { data, total, limit, offset };
  }

  async findOneMoodboard(id: string, organizationId: string): Promise<Moodboard> {
    const entity = await this.moodboardRepo.findOne({ where: { id, organizationId } });
    if (!entity) throw new NotFoundException('Moodboard not found');
    return entity;
  }

  async updateMoodboard(id: string, dto: UpdateMoodboardDto, organizationId: string): Promise<Moodboard> {
    const entity = await this.findOneMoodboard(id, organizationId);
    Object.assign(entity, dto);
    return this.moodboardRepo.save(entity);
  }

  async removeMoodboard(id: string, organizationId: string): Promise<Moodboard> {
    const entity = await this.findOneMoodboard(id, organizationId);
    return this.moodboardRepo.remove(entity);
  }

  // Session CRUD
  async createSession(dto: CreateSessionDto, organizationId: string): Promise<Session> {
    const entity = this.sessionRepo.create({ ...dto, organizationId });
    return this.sessionRepo.save(entity);
  }

  async findAllSessions(organizationId: string, limit = 50, offset = 0): Promise<{ data: Session[]; total: number; limit: number; offset: number }> {
    const [data, total] = await this.sessionRepo.findAndCount({
      where: { organizationId },
      order: { date: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { data, total, limit, offset };
  }

  async findOneSession(id: string, organizationId: string): Promise<Session> {
    const entity = await this.sessionRepo.findOne({ where: { id, organizationId } });
    if (!entity) throw new NotFoundException('Session not found');
    return entity;
  }

  async updateSession(id: string, dto: UpdateSessionDto, organizationId: string): Promise<Session> {
    const entity = await this.findOneSession(id, organizationId);
    Object.assign(entity, dto);
    return this.sessionRepo.save(entity);
  }

  async removeSession(id: string, organizationId: string): Promise<Session> {
    const entity = await this.findOneSession(id, organizationId);
    return this.sessionRepo.remove(entity);
  }
}
