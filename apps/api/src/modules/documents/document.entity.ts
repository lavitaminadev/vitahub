import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'organization_id', type: 'uuid' }) organizationId: string;
  @Column({ name: 'client_id', type: 'uuid', nullable: true }) clientId?: string;
  @Column({ type: 'varchar', length: 255 }) name: string;
  @Column({ type: 'varchar', length: 50, default: 'other' }) type: string;
  @Column({ name: 'file_url', type: 'varchar', length: 500, nullable: true }) fileUrl?: string;
  @Column({ name: 'drive_file_id', type: 'varchar', length: 255, nullable: true }) driveFileId?: string;
  @Column({ type: 'int', default: 1 }) version: number;
  @Column({ type: 'varchar', length: 20, default: 'draft' }) status: string;
  @Column({ name: 'uploaded_by', type: 'uuid' }) uploadedBy: string;
  @Column({ type: 'json', nullable: true }) tags?: string[];
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
