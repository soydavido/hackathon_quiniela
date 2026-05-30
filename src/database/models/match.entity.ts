import { BaseEntity, Column, CreateDateColumn, Entity as OrmEntity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { getEnv } from '../../common/utils/env';
import { FootballTeamEntity } from './football-team.entity';

export type MatchStage = 'octavos' | 'cuartos' | 'semifinal' | 'tercer_lugar' | 'final';
export type MatchStatus = 'pending' | 'finished';

@OrmEntity({ name: 'tb_match', schema: getEnv('DB_SCHEMA') })
export class MatchEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_match', type: 'bigint' })
  idMatch!: number;

  @Column({ type: 'varchar', length: 50, name: 'tx_stage' })
  stage!: MatchStage;

  @Column({ type: 'bigint', name: 'id_home_team', nullable: true })
  homeTeamId?: number;

  @ManyToOne(() => FootballTeamEntity, { eager: false, nullable: true })
  @JoinColumn({ name: 'id_home_team' })
  homeTeam?: FootballTeamEntity;

  @Column({ type: 'bigint', name: 'id_away_team', nullable: true })
  awayTeamId?: number;

  @ManyToOne(() => FootballTeamEntity, { eager: false, nullable: true })
  @JoinColumn({ name: 'id_away_team' })
  awayTeam?: FootballTeamEntity;

  @Column({ type: 'varchar', length: 20, name: 'tx_status', default: 'pending' })
  status!: MatchStatus;

  @Column({ type: 'bigint', name: 'id_winner', nullable: true })
  winnerId?: number;

  @ManyToOne(() => FootballTeamEntity, { eager: false, nullable: true })
  @JoinColumn({ name: 'id_winner' })
  winner?: FootballTeamEntity;

  @Column({ type: 'timestamp', name: 'ts_match_date', nullable: true })
  matchDate?: Date;

  @Column({ type: 'int', name: 'nu_match_order', default: 0 })
  matchOrder!: number;

  @CreateDateColumn({ type: 'timestamp', name: 'ts_insert_timestamp', default: () => 'now()' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'ts_update_timestamp', nullable: true })
  updatedAt?: Date;
}
