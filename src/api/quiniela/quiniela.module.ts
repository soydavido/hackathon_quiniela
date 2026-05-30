import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/modules/database.module';
import { getEnv } from '../../common/utils/env';
import { MatchEntity } from '../../database/models/match.entity';
import { ParticipantEntity } from '../../database/models/participant.entity';
import { PredictionEntity } from '../../database/models/prediction.entity';
import { QuinielaEntity } from '../../database/models/quiniela.entity';
import { QuinielaController } from './quiniela.controller';
import { QuinielaService } from './quiniela.service';

@Module({
  imports: [
    DatabaseModule.forEntities(getEnv('DB_NAME'), [
      QuinielaEntity,
      PredictionEntity,
      ParticipantEntity,
      MatchEntity,
    ]),
  ],
  controllers: [QuinielaController],
  providers: [QuinielaService],
  exports: [QuinielaService],
})
export class QuinielaModule {}
