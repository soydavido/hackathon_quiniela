import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/modules/database.module';
import { getEnv } from '../../common/utils/env';
import { FootballTeamEntity } from '../../database/models/football-team.entity';
import { FootballTeamsController } from './football-teams.controller';
import { FootballTeamsService } from './football-teams.service';

@Module({
  imports: [DatabaseModule.forEntities(getEnv('DB_NAME'), [FootballTeamEntity])],
  controllers: [FootballTeamsController],
  providers: [FootballTeamsService],
  exports: [FootballTeamsService],
})
export class FootballTeamsModule {}
