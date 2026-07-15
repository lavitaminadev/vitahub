import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id', type: 'uuid' }) userId: string;
  @Column({ type: 'varchar', length: 50 }) type: string;
  @Column({ type: 'varchar', length: 255 }) title: string;
  @Column({ type: 'text' }) message: string;
  @Column({ type: 'json', nullable: true }) data?: Record<string, any>;
  @Column({ type: 'boolean', default: false }) read: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
