import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetOperationsOverviewUseCase } from './get-operations-overview.use-case';

@ApiTags('Operaciones')
@Controller('operations')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class OperationsController {
  constructor(
    private overview: GetOperationsOverviewUseCase,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: 'Obtener vista general de operaciones' })
  getOverview(@Req() req: any) {
    return this.overview.execute(req.organizationId);
  }
}
