import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Integration } from './integration.entity';
import { IntegrationAccount } from './integration-account.entity';
import { IntegrationsController } from './integrations.controller';
import { CreateIntegrationUseCase } from './create-integration.use-case';
import { ListIntegrationsUseCase } from './list-integrations.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([Integration, IntegrationAccount])],
  controllers: [IntegrationsController],
  providers: [CreateIntegrationUseCase, ListIntegrationsUseCase],
})
export class IntegrationsModule {}
