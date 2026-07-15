import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check general del sistema' })
  async check() {
    return this.health.check();
  }

  @Get('db')
  @ApiOperation({ summary: 'Health check de base de datos' })
  async db() {
    return this.health.checkDb();
  }
}
