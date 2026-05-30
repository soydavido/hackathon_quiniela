import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('request_logs')
export class RequestLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  endpoint: string;

  @Column({ length: 100 })
  ip: string;

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({ name: 'method_requested', type: 'text', nullable: true })
  method: string;

  @Column({ name: 'team_token', length: 255, nullable: true })
  teamToken: string;

  @Column({ length: 255, nullable: true })
  hostname: string;

  @Column({ length: 255, nullable: true })
  direction: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
