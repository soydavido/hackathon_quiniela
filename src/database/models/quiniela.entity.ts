import { BaseEntity, Column, CreateDateColumn, Entity as OrmEntity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { getEnv } from '../../common/utils/env';
import { ParticipantEntity } from './participant.entity';
import { PredictionEntity } from './prediction.entity';

@OrmEntity({ name: 'tb_quiniela', schema: getEnv('DB_SCHEMA') })
export class QuinielaEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_quiniela', type: 'bigint' })
  idQuiniela!: number;

  @Column({ type: 'bigint', name: 'id_participant' })
  participantId!: number;

  @ManyToOne(() => ParticipantEntity)
  @JoinColumn({ name: 'id_participant' })
  participant!: ParticipantEntity;

  @Column({ type: 'boolean', name: 'bl_submitted', default: false })
  submitted!: boolean;

  @Column({ type: 'int', name: 'nu_score', default: 0 })
  score!: number;

  @OneToMany(() => PredictionEntity, (p) => p.quiniela)
  predictions!: PredictionEntity[];

  @CreateDateColumn({ type: 'timestamp', name: 'ts_insert_timestamp', default: () => 'now()' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'ts_update_timestamp', nullable: true })
  updatedAt?: Date;
}
