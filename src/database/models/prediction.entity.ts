import { BaseEntity, Column, CreateDateColumn, Entity as OrmEntity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { getEnv } from '../../common/utils/env';
import { FootballTeamEntity } from './football-team.entity';
import { MatchEntity } from './match.entity';
import { QuinielaEntity } from './quiniela.entity';

@OrmEntity({ name: 'tb_prediction', schema: getEnv('DB_SCHEMA') })
export class PredictionEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_prediction', type: 'bigint' })
  idPrediction!: number;

  @Column({ type: 'bigint', name: 'id_quiniela' })
  quinielaId!: number;

  @ManyToOne(() => QuinielaEntity, (q) => q.predictions)
  @JoinColumn({ name: 'id_quiniela' })
  quiniela!: QuinielaEntity;

  @Column({ type: 'bigint', name: 'id_match' })
  matchId!: number;

  @ManyToOne(() => MatchEntity)
  @JoinColumn({ name: 'id_match' })
  match!: MatchEntity;

  @Column({ type: 'bigint', name: 'id_predicted_winner' })
  predictedWinnerId!: number;

  @ManyToOne(() => FootballTeamEntity, { eager: false })
  @JoinColumn({ name: 'id_predicted_winner' })
  predictedWinner!: FootballTeamEntity;

  @Column({ type: 'boolean', name: 'bl_is_correct', nullable: true })
  isCorrect?: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'ts_insert_timestamp', default: () => 'now()' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'ts_update_timestamp', nullable: true })
  updatedAt?: Date;
}
