import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminModule } from './api/admin/admin.module';
import { FootballTeamsModule } from './api/football-teams/football-teams.module';
import { LeaderboardModule } from './api/leaderboard/leaderboard.module';
import { MatchesModule } from './api/matches/matches.module';
import { ParticipantsModule } from './api/participants/participants.module';
import { QuinielaModule } from './api/quiniela/quiniela.module';
import { GlobalExceptionFilter } from './common/errors/global-exception.filter';
import { ResponseLoggingInterceptor } from './common/interceptors/response-logging.interceptor';
import { TeamFilterMiddleware } from './common/middlewares/team-filter.middleware';
import { DatabaseModule } from './common/modules/database.module';
import { LoggerModule } from './common/modules/logger.module';
import { getEnv } from './common/utils/env';
import { appDataSourceOptions } from './database/data-source';
import { RequestLogEntity } from './database/models/request-log.entity';
import { TeamEntity } from './database/models/team.entity';

@Module({
  imports: [
    LoggerModule,
    ScheduleModule.forRoot(),
    DatabaseModule.forConnections(appDataSourceOptions),
    DatabaseModule.forEntities(getEnv('DB_NAME'), [TeamEntity, RequestLogEntity]),
    FootballTeamsModule,
    ParticipantsModule,
    MatchesModule,
    QuinielaModule,
    LeaderboardModule,
    AdminModule,
  ],
  providers: [
    TeamFilterMiddleware,
    GlobalExceptionFilter,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseLoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TeamFilterMiddleware)
      .exclude(
        { path: 'admin/(.*)', method: RequestMethod.ALL },
        { path: 'admin', method: RequestMethod.ALL },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
