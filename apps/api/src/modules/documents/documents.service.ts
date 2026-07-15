import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document) private repo: Repository<Document>,
  ) {}

  async create(dto: any, organizationId: string) {
    const doc = this.repo.create({ ...dto, organizationId });
    return this.repo.save(doc);
  }

  async findAll(organizationId: string) {
    return this.repo.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const doc = await this.repo.findOne({ where: { id, organizationId } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async update(id: string, dto: any, organizationId: string) {
    const doc = await this.findOne(id, organizationId);
    Object.assign(doc, dto);
    return this.repo.save(doc);
  }

  async remove(id: string, organizationId: string) {
    const doc = await this.findOne(id, organizationId);
    return this.repo.remove(doc);
  }
}
