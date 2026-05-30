import { Injectable, NestMiddleware, UnauthorizedException, HttpException } from '@nestjs/common';
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

    try {
      if (!token) {
        throw new UnauthorizedException('Se requiere el header x-team-token.');
      }

      const team = await this.teamRepo.findOne({ where: { token } as any });
      if (!team) {
        throw new UnauthorizedException('Token de equipo no válido.');
      }

      (req as any).team = { idTeam: team.idTeam, name: team.name, token: team.token };
      return next();
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException('Error al validar el token del equipo.', 500);
    }
  }
}
