import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration } from './integration.entity';
import { IntegrationStatus } from './integration-status.enum';

@Injectable()
export class UpdateIntegrationUseCase {
  constructor(
    @InjectRepository(Integration) private repo: Repository<Integration>,
  ) {}

  async execute(id: string, data: { status?: string; config?: Record<string, unknown> }, organizationId: string) {
    const integration = await this.repo.findOne({ where: { id, organizationId } });
    if (!integration) throw new NotFoundException('Integration not found');

    if (data.status) {
      integration.status = data.status as IntegrationStatus;
    }
    if (data.config) {
      integration.config = data.config;
    }

    return this.repo.save(integration);
  }
}
