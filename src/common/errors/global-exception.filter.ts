import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Logger } from '../services/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestLogEntity } from '../../database/models/request-log.entity';
import { getEnv } from '../utils/env';

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: Logger,
    @InjectRepository(RequestLogEntity, getEnv('DB_NAME'))
    private readonly logRepo: Repository<RequestLogEntity>,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';

    if (exception instanceof NotFoundException) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message || 'No encontrado';
      this.logger.warn(`404 Not Found: ${request.method} ${request.url}`);
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const responseBody = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.saveResponseLog(request, responseBody);

    if (typeof response.code === 'function') {
      response.code(status).send(responseBody);
    } else {
      response.status(status).json(responseBody);
    }
  }

  private async saveResponseLog(request: any, responseBody: any): Promise<void> {
    try {
      const ip = request.ip || request.headers['x-forwarded-for'];
      const token = request.headers['x-team-token'];
      await this.logRepo.save({
        endpoint: request.url,
        ip: typeof ip === 'string' ? ip : JSON.stringify(ip),
        body: JSON.stringify(responseBody),
        method: 'RESPONSE',
        teamToken: Array.isArray(token) ? token[0] : token,
        hostname: request.hostname,
        direction: 'OUTGOING',
      });
    } catch (e) {
      this.logger.error('Error guardando log de response', e);
    }
  }
}
