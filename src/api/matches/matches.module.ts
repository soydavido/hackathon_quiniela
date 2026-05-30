import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/modules/database.module';
import { getEnv } from '../../common/utils/env';
import { MatchEntity } from '../../database/models/match.entity';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

@Module({
  imports: [DatabaseModule.forEntities(getEnv('DB_NAME'), [MatchEntity])],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
