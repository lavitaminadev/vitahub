import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './leads/lead.entity';
import { LeadController } from './leads/lead.controller';
import { CreateLeadUseCase } from './leads/use-cases/create-lead.use-case';
import { ListLeadsUseCase } from './leads/use-cases/list-leads.use-case';
import { ConvertLeadUseCase } from './leads/use-cases/convert-lead.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([Lead])],
  controllers: [LeadController],
  providers: [CreateLeadUseCase, ListLeadsUseCase, ConvertLeadUseCase],
})
export class CrmModule {}
