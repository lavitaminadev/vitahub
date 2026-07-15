import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RegisterXpUseCase } from './register-xp.use-case';
import { GetWeeklyRankingUseCase } from './get-weekly-ranking.use-case';

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
  @ApiOperation({ summary: 'Registrar XP por entrega a tiempo' })
  registerDelivery(@Body() dto: any, @Req() req: any) {
    return this.registerXp.executeDelivery({ ...dto, organizationId: req.organizationId });
  }

  @Post('xp/penalty')
  @ApiOperation({ summary: 'Registrar penalización de XP' })
  registerPenalty(@Body() dto: any, @Req() req: any) {
    return this.registerXp.executePenalty({ ...dto, organizationId: req.organizationId });
  }

  @Get('ranking')
  @ApiOperation({ summary: 'Obtener ranking semanal de XP' })
  getRanking(@Req() req: any) {
    return this.ranking.execute(req.organizationId);
  }
}
