import { BaseEntity, Column, CreateDateColumn, Entity as OrmEntity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { getEnv } from '../../common/utils/env';
import { TeamEntity } from './team.entity';

@OrmEntity({ name: 'tb_participant', schema: getEnv('DB_SCHEMA') })
export class ParticipantEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_participant', type: 'bigint' })
  idParticipant!: number;

  @Column({ type: 'varchar', length: 100, name: 'nm_participant' })
  name!: string;

  @Column({ type: 'bigint', name: 'id_team' })
  teamId!: number;

  @ManyToOne(() => TeamEntity)
  @JoinColumn({ name: 'id_team' })
  team!: TeamEntity;

  @CreateDateColumn({ type: 'timestamp', name: 'ts_insert_timestamp', default: () => 'now()' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'ts_update_timestamp', nullable: true })
  updatedAt?: Date;
}
