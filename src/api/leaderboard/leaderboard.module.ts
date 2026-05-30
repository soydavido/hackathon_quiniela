import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/modules/database.module';
import { getEnv } from '../../common/utils/env';
import { ParticipantEntity } from '../../database/models/participant.entity';
import { QuinielaEntity } from '../../database/models/quiniela.entity';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';

@Module({
  imports: [DatabaseModule.forEntities(getEnv('DB_NAME'), [QuinielaEntity, ParticipantEntity])],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
})
export class LeaderboardModule {}
