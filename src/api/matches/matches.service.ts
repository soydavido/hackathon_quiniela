import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseService } from '../../common/services/base.service';
import { FootballTeamEntity } from '../../database/models/football-team.entity';
import { MatchEntity } from '../../database/models/match.entity';
import { getEnv } from '../../common/utils/env';

export const STAGE_ORDER = ['octavos', 'cuartos', 'semifinal', 'tercer_lugar', 'final'] as const;
export const STAGE_SLOTS: Record<string, number> = {
  octavos: 8,
  cuartos: 4,
  semifinal: 2,
  tercer_lugar: 1,
  final: 1,
};
export const STAGE_POINTS: Record<string, number> = {
  octavos: 1,
  cuartos: 2,
  semifinal: 3,
  tercer_lugar: 2,
  final: 4,
};

export function formatTeam(team: FootballTeamEntity | null | undefined) {
  if (!team) return null;
  return {
    idFootballTeam: team.idFootballTeam,
    name: team.name,
    countryCode: team.countryCode,
    flagUrl: team.flagUrl,
  };
}

export function formatMatchSlot(m: MatchEntity) {
  return {
    idMatch: m.idMatch,
    matchOrder: m.matchOrder,
    homeTeam: formatTeam(m.homeTeam),
    awayTeam: formatTeam(m.awayTeam),
    matchDate: m.matchDate ?? null,
    status: m.status,
    winner: formatTeam(m.winner),
  };
}

const TBD_SLOT = {
  idMatch: null,
  matchOrder: null,
  homeTeam: null,
  awayTeam: null,
  matchDate: null,
  status: 'tbd',
  winner: null,
};

@Injectable()
export class MatchesService extends BaseService<MatchEntity> {
  constructor(@InjectDataSource(getEnv('DB_NAME')) private readonly ds: DataSource) {
    super(ds.getRepository(MatchEntity));
  }

  // Lista plana para la vista en tabla
  async listAll(): Promise<any[]> {
    const matches = await this.repository.find({
      relations: ['homeTeam', 'awayTeam', 'winner'],
      order: { matchOrder: 'ASC', createdAt: 'ASC' },
    });
    return matches.map(formatMatchSlot);
  }

  // Bracket completo con TBD para rondas sin armar
  async getFullBracket(): Promise<{ bracket: any[] }> {
    const allMatches = await this.repository.find({
      relations: ['homeTeam', 'awayTeam', 'winner'],
      order: { matchOrder: 'ASC' },
    });

    const byStage = new Map<string, MatchEntity[]>();
    for (const m of allMatches) {
      if (!byStage.has(m.stage)) byStage.set(m.stage, []);
      byStage.get(m.stage)!.push(m);
    }

    const bracket = STAGE_ORDER.map((stage) => {
      const matches = byStage.get(stage) ?? [];
      const slots = STAGE_SLOTS[stage];
      const result: any[] = [];
      for (let i = 0; i < slots; i++) {
        result.push(matches[i] ? formatMatchSlot(matches[i]) : { ...TBD_SLOT });
      }
      return { stage, matches: result };
    });

    return { bracket };
  }
}
