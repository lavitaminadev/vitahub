import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

/**
 * Business logic for CRM contacts.
 */
@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact) private readonly repo: Repository<Contact>,
  ) {}

  async create(dto: CreateContactDto, organizationId: string): Promise<Contact> {
    const contact = this.repo.create({ ...dto, organizationId });
    return this.repo.save(contact);
  }

  async findAll(organizationId: string, limit = 50, offset = 0): Promise<{ data: Contact[]; total: number; limit: number; offset: number }> {
    const [data, total] = await this.repo.findAndCount({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { data, total, limit, offset };
  }

  async findOne(id: string, organizationId: string): Promise<Contact> {
    const contact = await this.repo.findOne({ where: { id, organizationId } });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async update(id: string, dto: UpdateContactDto, organizationId: string): Promise<Contact> {
    const contact = await this.findOne(id, organizationId);
    Object.assign(contact, dto);
    return this.repo.save(contact);
  }

  async remove(id: string, organizationId: string): Promise<Contact> {
    const contact = await this.findOne(id, organizationId);
    return this.repo.remove(contact);
  }
}
