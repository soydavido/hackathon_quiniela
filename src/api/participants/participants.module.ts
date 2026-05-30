import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/modules/database.module';
import { getEnv } from '../../common/utils/env';
import { ParticipantEntity } from '../../database/models/participant.entity';
import { QuinielaEntity } from '../../database/models/quiniela.entity';
import { ParticipantsController } from './participants.controller';
import { ParticipantsService } from './participants.service';

@Module({
  imports: [DatabaseModule.forEntities(getEnv('DB_NAME'), [ParticipantEntity, QuinielaEntity])],
  controllers: [ParticipantsController],
  providers: [ParticipantsService],
  exports: [ParticipantsService],
})
export class ParticipantsModule {}
