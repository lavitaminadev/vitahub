import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Piece } from './piece.entity';
import { PieceVersion } from './piece-version.entity';
import { Correction } from './correction.entity';
import { ProductionController } from './production.controller';
import { AssignPieceUseCase } from './assign-piece.use-case';
import { SubmitVersionUseCase } from './submit-version.use-case';
import { RejectPieceUseCase } from './reject-piece.use-case';
import { DeliverPieceUseCase } from './deliver-piece.use-case';
import { ListPiecesUseCase } from './list-pieces.use-case';
import { ProductionWorkflowService } from './production-workflow.service';
import { DesignBudgetModule } from '../design-budget/design-budget.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Piece, PieceVersion, Correction]), DesignBudgetModule, GamificationModule],
  controllers: [ProductionController],
  providers: [AssignPieceUseCase, SubmitVersionUseCase, RejectPieceUseCase, DeliverPieceUseCase, ListPiecesUseCase, ProductionWorkflowService],
  exports: [TypeOrmModule],
})
export class ProductionModule {}
