import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Document } from './document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

/**
 * Business logic for documents and file metadata.
 */
@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document) private readonly repo: Repository<Document>,
  ) {}

  async create(dto: CreateDocumentDto, organizationId: string, userId?: string): Promise<Document> {
    const doc = this.repo.create({ ...dto, organizationId, uploadedBy: userId });
    return this.repo.save(doc);
  }

  async findAll(organizationId: string, limit = 50, offset = 0, clientId?: string): Promise<{ data: Document[]; total: number; limit: number; offset: number }> {
    const where: FindOptionsWhere<Document> = { organizationId };
    if (clientId) where.clientId = clientId;
    const [data, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { data, total, limit, offset };
  }

  async findOne(id: string, organizationId: string): Promise<Document> {
    const doc = await this.repo.findOne({ where: { id, organizationId } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async update(id: string, dto: UpdateDocumentDto, organizationId: string): Promise<Document> {
    const doc = await this.findOne(id, organizationId);
    Object.assign(doc, dto);
    return this.repo.save(doc);
  }

  async remove(id: string, organizationId: string): Promise<Document> {
    const doc = await this.findOne(id, organizationId);
    return this.repo.remove(doc);
  }
}
