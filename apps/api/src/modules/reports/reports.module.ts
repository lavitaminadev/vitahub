import { Module } from '@nestjs/common';
import { ReportingController } from './reports.controller';

@Module({
  controllers: [ReportingController],
})
export class ReportsModule {}
