import { BaseEntity, Column, CreateDateColumn, Entity as OrmEntity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { getEnv } from '../../common/utils/env';

@OrmEntity({ name: 'tb_team', schema: getEnv('DB_SCHEMA') })
export class TeamEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_team', type: 'bigint' })
  idTeam!: number;

  @Column({ type: 'varchar', length: 100, name: 'nm_team' })
  name!: string;

  @Column({ type: 'varchar', length: 100, name: 'tx_token', unique: true })
  token!: string;

  @CreateDateColumn({ type: 'timestamp', name: 'ts_insert_timestamp', default: () => 'now()' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'ts_update_timestamp', nullable: true })
  updatedAt?: Date;
}
