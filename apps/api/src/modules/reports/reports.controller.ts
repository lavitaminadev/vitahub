import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('Reportes')
@Controller('reporting')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ReportingController {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Reporte ejecutivo con estadísticas agregadas' })
  async dashboard(@Req() req: any) {
    const orgId = req.organizationId;
    const [clientCount] = await this.dataSource.query(
      'SELECT COUNT(*) as total FROM clients WHERE organization_id = ?', [orgId]);
    const [pieceStats] = await this.dataSource.query(
      `SELECT status, COUNT(*) as count FROM pieces WHERE organization_id = ? GROUP BY status`, [orgId]);
    const [leadStats] = await this.dataSource.query(
      `SELECT status, COUNT(*) as count FROM leads WHERE organization_id = ? GROUP BY status`, [orgId]);
    const [udStats] = await this.dataSource.query(
      `SELECT COALESCE(SUM(contracted),0) as contracted, COALESCE(SUM(reserved),0) as reserved, COALESCE(SUM(consumed),0) as consumed FROM ud_budgets WHERE client_id IN (SELECT id FROM clients WHERE organization_id = ?)`, [orgId]);
    return { clients: clientCount?.total || 0, pieces: pieceStats, leads: leadStats, ud: udStats };
  }
}
