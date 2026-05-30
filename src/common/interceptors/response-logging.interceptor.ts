import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestLogEntity } from '../../database/models/request-log.entity';
import { getEnv } from '../utils/env';
import { Logger } from '@nestjs/common';

@Injectable()
export class ResponseLoggingInterceptor implements NestInterceptor {
  protected readonly logger = new Logger(ResponseLoggingInterceptor.name);

  constructor(
    @InjectRepository(RequestLogEntity, getEnv('DB_NAME'))
    private readonly logRepo: Repository<RequestLogEntity>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const ip = request.ip || request.headers['x-forwarded-for'];
    const endpoint = request.url;
    const hostname = request.hostname;
    const raw = request.headers['x-team-token'];
    const teamToken = Array.isArray(raw) ? raw[0] : raw;

    return next.handle().pipe(
      tap((data) => {
        this.saveResponseLog(data, endpoint, hostname, teamToken, ip, response.statusCode);
      }),
    );
  }

  private async saveResponseLog(body: any, endpoint: string, hostname: string, teamToken: string | undefined, ip: any, statusCode?: number) {
    try {
      await this.logRepo.save({
        endpoint,
        ip: typeof ip === 'string' ? ip : JSON.stringify(ip),
        body: body ? JSON.stringify(body) : undefined,
        method: 'RESPONSE',
        teamToken,
        hostname,
        direction: 'OUTGOING',
      });
    } catch (e) {
      this.logger.error('Error guardando log de response', e);
    }
  }
}
