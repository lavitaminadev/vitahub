import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from '../../organizations/organization.entity';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'organization_id', type: 'uuid' }) organizationId: string;
  @ManyToOne(() => Organization) @JoinColumn({ name: 'organization_id' }) organization: Organization;
  @Column({ type: 'varchar', length: 255 }) name: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) email?: string;
  @Column({ type: 'varchar', length: 20, nullable: true }) phone?: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) company?: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) source?: string;
  @Column({ type: 'varchar', length: 50, default: 'new' }) status: string;
  @Column({ name: 'assigned_to', type: 'uuid', nullable: true }) assignedTo?: string;
  @Column({ type: 'text', nullable: true }) notes?: string;
  @Column({ name: 'converted_at', type: 'timestamp', nullable: true }) convertedAt?: Date;
  @Column({ name: 'converted_to_client_id', type: 'uuid', nullable: true }) convertedToClientId?: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
