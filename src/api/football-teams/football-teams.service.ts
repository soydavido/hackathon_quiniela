import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { getEnv } from '../../common/utils/env';
import { FootballTeamEntity } from '../../database/models/football-team.entity';

@Injectable()
export class FootballTeamsService {
  private readonly repo: Repository<FootballTeamEntity>;

  constructor(@InjectDataSource(getEnv('DB_NAME')) private readonly ds: DataSource) {
    this.repo = ds.getRepository(FootballTeamEntity);
  }

  async listAll(): Promise<FootballTeamEntity[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async create(data: { name: string; countryCode: string; flagUrl: string }): Promise<FootballTeamEntity> {
    return this.repo.save(this.repo.create(data));
  }
}
