import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/modules/database.module';
import { getEnv } from '../../common/utils/env';
import { FootballTeamEntity } from '../../database/models/football-team.entity';
import { MatchEntity } from '../../database/models/match.entity';
import { PredictionEntity } from '../../database/models/prediction.entity';
import { QuinielaEntity } from '../../database/models/quiniela.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    DatabaseModule.forEntities(getEnv('DB_NAME'), [
      FootballTeamEntity,
      MatchEntity,
      PredictionEntity,
      QuinielaEntity,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
