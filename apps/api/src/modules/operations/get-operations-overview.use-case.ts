import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class GetOperationsOverviewUseCase {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async execute(organizationId: string) {
    const [podRows] = await this.dataSource.query(
      `SELECT id, name, member_count as memberCount, capacity, current_load as currentLoad, status
       FROM pods WHERE organization_id = ?`, [organizationId]);

    const [memberRows] = await this.dataSource.query(
      `SELECT u.id, u.name, u.role,
        (SELECT COUNT(*) FROM pieces p WHERE p.assigned_to = u.id AND p.status NOT IN ('delivered','cancelled')) as currentPieces,
        COALESCE(p.capacity, 0) as capacity
       FROM users u
       LEFT JOIN pods p ON p.id = u.pod_id
       WHERE u.organization_id = ?`, [organizationId]);

    const pods = Array.isArray(podRows) ? podRows : [];
    const team = Array.isArray(memberRows) ? memberRows : [];

    const totalCapacity = pods.reduce((sum: number, p: any) => sum + (p.capacity || 0), 0);
    const usedCapacity = pods.reduce((sum: number, p: any) => sum + (p.currentLoad || 0), 0);

    return { pods, team, totalCapacity, usedCapacity };
  }
}
