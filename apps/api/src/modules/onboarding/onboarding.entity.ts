import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('onboarding')
export class Onboarding {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'client_id', type: 'uuid' }) clientId: string;
  @Column({ name: 'organization_id', type: 'uuid' }) organizationId: string;
  @Column({ type: 'varchar', length: 255 }) step: string;
  @Column({ type: 'varchar', length: 20, default: 'pending' }) status: string;
  @Column({ name: 'assigned_to', type: 'uuid', nullable: true }) assignedTo?: string;
  @Column({ name: 'completed_at', type: 'timestamp', nullable: true }) completedAt?: Date;
  @Column({ type: 'text', nullable: true }) notes?: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
