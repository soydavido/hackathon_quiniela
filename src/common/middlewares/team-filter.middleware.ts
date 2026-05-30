import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamEntity } from '../../database/models/team.entity';
import { RequestLogEntity } from '../../database/models/request-log.entity';
import { getEnv } from '../utils/env';
import { Logger } from '@nestjs/common';

@Injectable()
export class TeamFilterMiddleware implements NestMiddleware {
  protected readonly logger = new Logger(TeamFilterMiddleware.name);

  constructor(
    @InjectRepository(TeamEntity, getEnv('DB_NAME'))
    private readonly teamRepo: Repository<TeamEntity>,
    @InjectRepository(RequestLogEntity, getEnv('DB_NAME'))
    private readonly logRepo: Repository<RequestLogEntity>,
  ) {}

  async use(req: any, res: any, next: () => void) {
    if (req.method === 'OPTIONS') return next();

    const raw = req.headers['x-team-token'] as string | undefined;
    const token = Array.isArray(raw) ? raw[0] : raw;

    const sendError = (code: number, message: string) => {
      res.statusCode = code;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ statusCode: code, message, timestamp: new Date().toISOString(), path: req.url }));
    };

    if (!token) {
      return sendError(401, 'Se requiere el header x-team-token.');
    }

    try {
      const team = await this.teamRepo.findOne({ where: { token } as any });
      if (!team) {
        return sendError(401, 'Token de equipo no válido.');
      }

      (req as any).team = { idTeam: team.idTeam, name: team.name, token: team.token };
      return next();
    } catch (err) {
      this.logger.error('Error validando token de equipo', err);
      return sendError(500, 'Error al validar el token del equipo.');
    }
  }
}
