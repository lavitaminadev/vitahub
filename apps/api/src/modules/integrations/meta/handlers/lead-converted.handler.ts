import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetaConversionsService } from '../meta-conversions.service';
import { IntegrationAccount } from '../../integration-account.entity';
import { IntegrationAccountType } from '../../integration-account-type.enum';
import { revealSecret } from '../../../../shared/security/integration-secrets';
import { Lead } from '../../../crm/leads/lead.entity';

@Injectable()
export class LeadConvertedHandler {
  private readonly logger = new Logger(LeadConvertedHandler.name);

  constructor(
    private readonly conversionsService: MetaConversionsService,
    @InjectRepository(IntegrationAccount) private readonly accountsRepo: Repository<IntegrationAccount>,
    @InjectRepository(Lead) private readonly leadRepo: Repository<Lead>,
  ) {}

  @OnEvent('lead.converted')
  async handleLeadConvertedEvent(payload: { leadId: string; clientId: string }) {
    try {
      const lead = await this.leadRepo.findOne({ where: { id: payload.leadId } });
      if (!lead || !lead.email && !lead.phone) return;

      // Ensure the lead came from Meta originally
      if (lead.source !== 'meta_lead_ads' && !lead.metadata?.adId) return;

      const pageId = lead.metadata?.pageId;
      if (!pageId) return;

      const pageAccount = await this.accountsRepo.findOne({
        where: {
          accountType: IntegrationAccountType.PAGE,
          externalId: pageId,
          integration: { organizationId: lead.organizationId },
        },
        relations: { integration: true },
      });

      if (!pageAccount?.integration) return;

      const pixelId = typeof pageAccount.integration.config?.pixelId === 'string'
        ? pageAccount.integration.config.pixelId
        : undefined;
      if (!pixelId) return;

      const accessToken = process.env.META_CONVERSIONS_ACCESS_TOKEN
        || revealSecret(pageAccount.accessToken)
        || revealSecret(typeof pageAccount.integration.config?.accessToken === 'string'
          ? pageAccount.integration.config.accessToken
          : undefined);
      if (!accessToken) return;

      await this.conversionsService.sendServerEvent(pixelId, accessToken, {
        eventName: 'Purchase', // Using Purchase because it's a Won lead (converted to Client)
        eventTime: Math.floor(Date.now() / 1000),
        actionSource: 'system_generated',
        userData: {
          em: lead.email ? [lead.email] : undefined,
          ph: lead.phone ? [lead.phone] : undefined,
          externalId: [lead.id],
        },
        customData: {
          currency: 'CLP',
          value: 100000, // Placeholder value, ideally fetched from Client plan
        },
      });

      this.logger.log(`CAPI Event sent for Lead ${lead.id}`);
    } catch (error) {
      this.logger.error(`Error sending CAPI event for Lead ${payload.leadId}:`, error);
    }
  }
}
