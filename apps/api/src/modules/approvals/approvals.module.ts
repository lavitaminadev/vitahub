import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalRequest } from './approval-request.entity';
import { ApprovalsController } from './approvals.controller';
import { ListApprovalsUseCase } from './list-approvals.use-case';
import { UpdateApprovalStatusUseCase } from './update-approval-status.use-case';
import { Piece } from '../production/piece.entity';
import { PieceVersion } from '../production/piece-version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApprovalRequest, Piece, PieceVersion])],
  controllers: [ApprovalsController],
  providers: [ListApprovalsUseCase, UpdateApprovalStatusUseCase],
})
export class ApprovalsModule {}
