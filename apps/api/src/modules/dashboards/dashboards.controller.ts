import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DashboardsService } from './dashboards.service';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class DashboardsController {
  constructor(private service: DashboardsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Dashboard general de la organización' })
  overview(@Req() req: any) {
    return this.service.getOverview(req.organizationId);
  }

  @Get('production')
  @ApiOperation({ summary: 'Dashboard de producción' })
  production(@Req() req: any) {
    return this.service.getProduction(req.organizationId);
  }

  @Get('financial')
  @ApiOperation({ summary: 'Dashboard financiero' })
  financial(@Req() req: any) {
    return this.service.getFinancial(req.organizationId);
  }
}
