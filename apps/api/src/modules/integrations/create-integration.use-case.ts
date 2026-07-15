import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration } from './integration.entity';
import { IntegrationProvider } from './integration-provider.enum';

@Injectable()
export class CreateIntegrationUseCase {
  constructor(
    @InjectRepository(Integration) private repo: Repository<Integration>,
  ) {}

  async execute(data: { organizationId: string; provider: IntegrationProvider; name: string; config?: Record<string, any> }) {
    const integration = this.repo.create(data as any);
    return this.repo.save(integration);
  }
}
