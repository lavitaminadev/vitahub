import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './service.entity';
import { Quote } from './quote.entity';
import { Pack } from './pack.entity';
import { CatalogController } from './catalog.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Service, Quote, Pack])],
  controllers: [CatalogController],
})
export class CatalogModule {}
