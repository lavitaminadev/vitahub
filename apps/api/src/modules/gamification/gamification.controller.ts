import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RegisterXpUseCase } from './register-xp.use-case';
import { GetWeeklyRankingUseCase } from './get-weekly-ranking.use-case';
import { RegisterDeliveryDto } from './dto/register-delivery.dto';
import { RegisterPenaltyDto } from './dto/register-penalty.dto';
import { Roles } from '../../core/authorization/roles.decorator';
import { UserRole } from '../organizations/user-role.enum';
import type { AuthenticatedRequest } from '@shared/types/request';

@ApiTags('Gamificación')
@Controller('gamification')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class GamificationController {
  constructor(
    private registerXp: RegisterXpUseCase,
    private ranking: GetWeeklyRankingUseCase,
  ) {}

  @Post('xp/delivery')
  @Roles(UserRole.ART_DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Registrar XP por entrega a tiempo' })
  registerDelivery(@Body() dto: RegisterDeliveryDto, @Req() req: AuthenticatedRequest) {
    return this.registerXp.executeDelivery({ ...dto, organizationId: req.organizationId });
  }

  @Post('xp/penalty')
  @Roles(UserRole.ART_DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Registrar penalización de XP' })
  registerPenalty(@Body() dto: RegisterPenaltyDto, @Req() req: AuthenticatedRequest) {
    return this.registerXp.executePenalty({ ...dto, organizationId: req.organizationId });
  }

  @Get('ranking')
  @ApiOperation({ summary: 'Obtener ranking semanal de XP' })
  getRanking(@Req() req: AuthenticatedRequest) {
    return this.ranking.execute(req.organizationId);
  }
}
