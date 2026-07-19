import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportingController } from '../../../src/modules/reports/reports.controller';

const dataSource = {
  query: vi.fn(),
};

describe('ReportingController', () => {
  let controller: ReportingController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new ReportingController(dataSource as any);
  });

  it('uses the real invoices table instead of billing_invoices for aggregate reports', async () => {
    dataSource.query
      .mockResolvedValueOnce([{ total: 1000 }])
      .mockResolvedValueOnce([{ total: 3 }])
      .mockResolvedValueOnce([{ avg: 12 }])
      .mockResolvedValueOnce([[{ month: '2026-07', ud: 5 }]])
      .mockResolvedValueOnce([[{ name: 'Cliente Uno', revenue: 5 }]]);

    const result = await controller.reports({
      organizationId: 'org-1',
      user: { role: 'admin' },
    } as any);

    expect(dataSource.query.mock.calls[0][0]).toContain('FROM invoices');
    expect(dataSource.query.mock.calls[0][0]).not.toContain('billing_invoices');
    expect(result.totalRevenue).toBe(1000);
  });

  it('scopes client portal reports to the authenticated client id', async () => {
    dataSource.query
      .mockResolvedValueOnce([{ total: 2500 }])
      .mockResolvedValueOnce([{ total: 2 }])
      .mockResolvedValueOnce([{ avg: 20 }])
      .mockResolvedValueOnce([[{ month: '2026-07', ud: 8 }]])
      .mockResolvedValueOnce([[{ name: 'Cliente Portal', revenue: 8 }]]);

    await controller.reports({
      organizationId: 'org-1',
      user: { role: 'client', clientId: 'client-1' },
    } as any);

    expect(dataSource.query.mock.calls[0][0]).toContain('client_id = ?');
    expect(dataSource.query.mock.calls[0][1]).toEqual(['org-1', 'client-1']);
    expect(dataSource.query.mock.calls[4][1]).toEqual(['org-1', 'client-1']);
  });

  it('returns strategic metrics without invented targets', async () => {
    dataSource.query
      .mockResolvedValueOnce([{ total: 12000 }])
      .mockResolvedValueOnce([{ total: 7 }])
      .mockResolvedValueOnce([{ total: 140 }])
      .mockResolvedValueOnce([{ pct: 68 }])
      .mockResolvedValueOnce([{ pct: 90 }]);

    const result = await controller.kpi({
      organizationId: 'org-1',
      user: { role: 'admin' },
    } as any);

    expect(result.revenueTarget).toBeNull();
    expect(result.clientTarget).toBeNull();
    expect(result.udTarget).toBeNull();
    expect(result.utilizationTarget).toBeNull();
    expect(result.nps).toBeNull();
    expect(result.growthRate).toBeNull();
  });
});
