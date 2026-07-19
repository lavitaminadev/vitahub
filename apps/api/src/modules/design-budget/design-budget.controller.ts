import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetOrCreateBudgetUseCase } from './get-or-create-budget.use-case';
import { ReserveUdUseCase } from './reserve-ud.use-case';
import { ConfirmUdConsumptionUseCase } from './confirm-ud-consumption.use-case';
import { GetOrCreateBudgetDto } from './dto/get-or-create-budget.dto';
import { ReserveUdDto } from './dto/reserve-ud.dto';
import { ConfirmUdDto } from './dto/confirm-ud.dto';
import { Roles } from '../../core/authorization/roles.decorator';
import { UserRole } from '../organizations/user-role.enum';

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
  @Roles(UserRole.OPERATIONS_DIRECTOR, UserRole.ART_DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener o crear presupuesto UD del mes' })
  getOrCreateBudget(@Body() dto: GetOrCreateBudgetDto) {
    return this.getOrCreate.execute(dto.clientId, dto.year, dto.month, dto.defaultBudget);
  }

  @Post('reserve')
  @Roles(UserRole.ART_DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Reservar UDs para una pieza' })
  reserveUd(@Body() dto: ReserveUdDto) {
    return this.reserve.execute(dto.clientId, dto.pieceId, dto.amount, dto.year, dto.month);
  }

  @Post('confirm')
  @Roles(UserRole.ART_DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Confirmar consumo de UDs' })
  confirmUd(@Body() dto: ConfirmUdDto) {
    return this.confirm.execute(dto.clientId, dto.pieceId, dto.year, dto.month);
  }
}
