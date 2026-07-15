import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetOrCreateBudgetUseCase } from './get-or-create-budget.use-case';
import { ReserveUdUseCase } from './reserve-ud.use-case';
import { ConfirmUdConsumptionUseCase } from './confirm-ud-consumption.use-case';

@ApiTags('Presupuesto UD')
@Controller('design-budget')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class DesignBudgetController {
  constructor(
    private getOrCreate: GetOrCreateBudgetUseCase,
    private reserve: ReserveUdUseCase,
    private confirm: ConfirmUdConsumptionUseCase,
  ) {}

  @Post('budget')
  @ApiOperation({ summary: 'Obtener o crear presupuesto UD del mes' })
  getOrCreateBudget(@Body() dto: { clientId: string; year: number; month: number; defaultBudget?: number }) {
    return this.getOrCreate.execute(dto.clientId, dto.year, dto.month, dto.defaultBudget);
  }

  @Post('reserve')
  @ApiOperation({ summary: 'Reservar UDs para una pieza' })
  reserveUd(@Body() dto: { clientId: string; pieceId: string; amount: number; year: number; month: number }) {
    return this.reserve.execute(dto.clientId, dto.pieceId, dto.amount, dto.year, dto.month);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirmar consumo de UDs' })
  confirmUd(@Body() dto: { clientId: string; pieceId: string; year: number; month: number }) {
    return this.confirm.execute(dto.clientId, dto.pieceId, dto.year, dto.month);
  }
}
