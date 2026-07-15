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
  @ApiOperation({ summary: 'Dashboard ejecutivo' })
  async dashboard(@Req() req: any) {
    const orgId = req.organizationId;

    const [clientRow] = await this.dataSource.query(
      `SELECT COUNT(*) as total FROM clients WHERE organization_id = ? AND status = 'active'`, [orgId]);
    const [pieceRows] = await this.dataSource.query(
      `SELECT status, COUNT(*) as count FROM pieces WHERE organization_id = ? GROUP BY status`, [orgId]);
    const [xpRow] = await this.dataSource.query(
      `SELECT COALESCE(SUM(amount),0) as total FROM xp_events WHERE user_id IN (SELECT id FROM users WHERE organization_id = ?) AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`, [orgId]);
    const [udRow] = await this.dataSource.query(
      `SELECT COALESCE(SUM(contracted),0) as contracted, COALESCE(SUM(consumed),0) as consumed, COALESCE(SUM(reserved),0) as reserved FROM ud_budgets WHERE client_id IN (SELECT id FROM clients WHERE organization_id = ?)`, [orgId]);

    const pendingPieces = (Array.isArray(pieceRows) ? pieceRows : []).reduce(
      (sum: number, p: any) => p.status !== 'delivered' && p.status !== 'cancelled' ? sum + Number(p.count) : sum, 0);
    const pieces = (Array.isArray(pieceRows) ? pieceRows : []).map((p: any) => ({ status: p.status, count: Number(p.count) }));

    return {
      activeClients: Number(clientRow?.total || 0),
      pendingPieces,
      teamXp: Number(xpRow?.total || 0),
      monthUd: Number(udRow?.consumed || 0),
      ud: { contracted: Number(udRow?.contracted || 0), consumed: Number(udRow?.consumed || 0), reserved: Number(udRow?.reserved || 0) },
      pieces,
    };
  }

  @Get('reports')
  @ApiOperation({ summary: 'Reportes generales' })
  async reports(@Req() req: any) {
    const orgId = req.organizationId;

    const [revRow] = await this.dataSource.query(
      `SELECT COALESCE(SUM(amount),0) as total FROM billing_invoices WHERE organization_id = ? AND status = 'paid'`, [orgId]);
    const [projRow] = await this.dataSource.query(
      `SELECT COUNT(*) as total FROM pieces WHERE organization_id = ? AND status NOT IN ('delivered','cancelled')`, [orgId]);
    const [avgUdRow] = await this.dataSource.query(
      `SELECT COALESCE(AVG(default_ud_budget),0) as avg FROM clients WHERE organization_id = ?`, [orgId]);

    const [monthlyRows] = await this.dataSource.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COALESCE(SUM(ud_amount),0) as ud
       FROM pieces WHERE organization_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY month ORDER BY month ASC`, [orgId]);
    const monthly = (Array.isArray(monthlyRows) ? monthlyRows : []).map((r: any) => ({
      month: r.month, revenue: 0, ud: Number(r.ud),
    }));

    const [topRows] = await this.dataSource.query(
      `SELECT c.name, COALESCE(SUM(p.ud_amount),0) as revenue
       FROM clients c LEFT JOIN pieces p ON p.client_id = c.id
       WHERE c.organization_id = ? GROUP BY c.id ORDER BY revenue DESC LIMIT 5`, [orgId]);

    return {
      totalRevenue: Number(revRow?.total || 0),
      activeProjects: Number(projRow?.total || 0),
      avgUdPerClient: Math.round(Number(avgUdRow?.avg || 0)),
      monthlyData: monthly,
      topClients: Array.isArray(topRows) ? topRows : [],
    };
  }

  @Get('kpi')
  @ApiOperation({ summary: 'KPIs estratégicos para dirección' })
  async kpi(@Req() req: any) {
    const orgId = req.organizationId;

    const [revRow] = await this.dataSource.query(
      `SELECT COALESCE(SUM(amount),0) as total FROM billing_invoices WHERE organization_id = ? AND status = 'paid' AND YEAR(created_at) = YEAR(NOW())`, [orgId]);
    const [clientRow] = await this.dataSource.query(
      `SELECT COUNT(*) as total FROM clients WHERE organization_id = ? AND status = 'active'`, [orgId]);
    const [udRow] = await this.dataSource.query(
      `SELECT COALESCE(SUM(contracted),0) as total FROM ud_budgets WHERE client_id IN (SELECT id FROM clients WHERE organization_id = ?)`, [orgId]);
    const [utilRow] = await this.dataSource.query(
      `SELECT COALESCE(AVG(current_load * 100.0 / NULLIF(capacity, 0)), 0) as pct FROM pods WHERE organization_id = ?`, [orgId]);
    const [retRow] = await this.dataSource.query(
      `SELECT COUNT(DISTINCT client_id) * 100.0 / NULLIF((SELECT COUNT(*) FROM clients WHERE organization_id = ?), 0) as pct FROM pieces WHERE organization_id = ? AND status = 'delivered'`, [orgId, orgId]);

    return {
      revenueYtd: Number(revRow?.total || 0),
      revenueTarget: 500000,
      activeClients: Number(clientRow?.total || 0),
      clientTarget: 20,
      udSold: Number(udRow?.total || 0),
      udTarget: 500,
      teamUtilization: Math.round(Number(utilRow?.pct || 0)),
      utilizationTarget: 80,
      clientRetention: Math.round(Number(retRow?.pct || 0)),
      nps: 8,
      growthRate: 15,
    };
  }
}
