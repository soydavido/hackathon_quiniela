import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamEntity } from '../../database/models/team.entity';
import { getEnv } from '../utils/env';

export const SKIP_AUTH_KEY = 'skipAuth';

@Injectable()
export class TeamAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(TeamEntity, getEnv('DB_NAME'))
    private readonly teamRepo: Repository<TeamEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const request = context.switchToHttp().getRequest();
    const raw = request.headers['x-team-token'];
    const token = Array.isArray(raw) ? raw[0] : raw;

    if (!token) throw new UnauthorizedException('Se requiere el header x-team-token.');

    const team = await this.teamRepo.findOne({ where: { token } as any });
    if (!team) throw new UnauthorizedException('Token de equipo no válido.');

    request.team = { idTeam: team.idTeam, name: team.name, token: team.token };
    return true;
  }
}
