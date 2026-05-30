import { BaseEntity, Column, CreateDateColumn, Entity as OrmEntity, PrimaryGeneratedColumn } from 'typeorm';
import { getEnv } from '../../common/utils/env';

@OrmEntity({ name: 'tb_football_team', schema: getEnv('DB_SCHEMA') })
export class FootballTeamEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_football_team', type: 'bigint' })
  idFootballTeam!: number;

  @Column({ type: 'varchar', length: 100, name: 'nm_name' })
  name!: string;

  @Column({ type: 'varchar', length: 10, name: 'tx_country_code' })
  countryCode!: string;

  @Column({ type: 'varchar', length: 500, name: 'tx_flag_url' })
  flagUrl!: string;

  @CreateDateColumn({ type: 'timestamp', name: 'ts_insert_timestamp', default: () => 'now()' })
  createdAt!: Date;
}
