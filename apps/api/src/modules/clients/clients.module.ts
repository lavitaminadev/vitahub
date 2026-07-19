import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './client.entity';
import { ClientsController } from './clients.controller';
import { CreateClientUseCase } from './create-client.use-case';
import { ListClientsUseCase } from './list-clients.use-case';
import { GetClientUseCase } from './get-client.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([Client])],
  controllers: [ClientsController],
  providers: [CreateClientUseCase, ListClientsUseCase, GetClientUseCase],
  exports: [TypeOrmModule.forFeature([Client])],
})
export class ClientsModule {}
