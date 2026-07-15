import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalRequest } from './approval-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApprovalRequest])],
})
export class ApprovalsModule {}
