import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../../../modules/crm/leads/lead.entity';
import { Client } from '../../../modules/clients/client.entity';
import { Onboarding } from '../../../modules/onboarding/onboarding.entity';
import { Notification } from '../../notifications/notification.entity';

@Injectable()
export class LeadConvertedHandler {
  constructor(
    @InjectRepository(Lead) private leadRepo: Repository<Lead>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    @InjectRepository(Onboarding) private onboardingRepo: Repository<Onboarding>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  @OnEvent('lead.converted')
  async handle(payload: { leadId: string; clientId: string }) {
    const lead = await this.leadRepo.findOne({ where: { id: payload.leadId } });
    if (!lead) return;

    const client = await this.clientRepo.findOne({ where: { id: payload.clientId } });
    if (!client) return;

    if (lead.assignedTo) {
      const notif = this.notifRepo.create({
        userId: lead.assignedTo,
        type: 'lead.converted',
        title: 'Lead convertido',
        message: `El lead ${lead.name} se ha convertido en cliente.`,
        data: { leadId: payload.leadId, clientId: payload.clientId },
      });
      await this.notifRepo.save(notif);
    }

    const onboarding = this.onboardingRepo.create({
      clientId: payload.clientId,
      organizationId: client.organizationId,
      step: 'welcome',
      status: 'pending',
      assignedTo: lead.assignedTo,
    });
    await this.onboardingRepo.save(onboarding);
  }
}
