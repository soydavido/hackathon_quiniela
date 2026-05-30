import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/errors/global-exception.filter';
import { Logger } from './common/services/logger.service';
import { getEnv } from './common/utils/env';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RequestLogEntity } from './database/models/request-log.entity';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  const port = Number(getEnv('APP_PORT', process.env.PORT ?? '3000'));

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-team-token', 'x-admin-token'],
    credentials: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  app.useGlobalFilters(app.get(GlobalExceptionFilter));

  const fastifyInstance = app.getHttpAdapter().getInstance();
  const logger = app.get(Logger);
  const requestLogRepo = app.get(getRepositoryToken(RequestLogEntity, getEnv('DB_NAME')));

  // Log all incoming requests
  fastifyInstance.addHook('preHandler', async (request: any) => {
    const raw = request.headers['x-team-token'];
    const teamToken = Array.isArray(raw) ? raw[0] : raw;
    try {
      await requestLogRepo.save({
        endpoint: request.url,
        ip: typeof request.ip === 'string' ? request.ip : JSON.stringify(request.ip),
        body: request.body ? JSON.stringify(request.body) : undefined,
        method: request.method,
        teamToken,
        hostname: request.hostname,
        direction: 'INCOMING',
      });
    } catch (e) {
      logger.error('Error guardando log INCOMING', e);
    }
  });

  await app.listen(port, '0.0.0.0');
  logger.log(`Hackathon API corriendo en puerto ${port}`);
}

bootstrap();
