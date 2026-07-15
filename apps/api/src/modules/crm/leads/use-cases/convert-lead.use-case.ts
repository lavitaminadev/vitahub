import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Lead } from '../lead.entity';
import { LeadStatus } from '../lead-status.enum';
import { Client } from '../../../clients/client.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ConvertLeadUseCase {
  constructor(
    @InjectRepository(Lead) private leadRepo: Repository<Lead>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(leadId: string, organizationId: string) {
    return this.leadRepo.manager.transaction(async (manager: EntityManager) => {
      const lead = await manager.findOne(Lead, { where: { id: leadId, organizationId } });
      if (!lead) throw new NotFoundException('Lead no encontrado');

      const client = manager.create(Client, {
        organizationId,
        name: lead.name,
        leadId: lead.id,
        status: 'onboarding' as any,
      });
      const savedClient = await manager.save(Client, client);

      lead.status = LeadStatus.WON;
      lead.convertedAt = new Date();
      lead.convertedToClientId = savedClient.id;
      await manager.save(Lead, lead);

      this.eventEmitter.emit('lead.converted', { leadId: lead.id, clientId: savedClient.id });
      return { lead, client: savedClient };
    });
  }
}
