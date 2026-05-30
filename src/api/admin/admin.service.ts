import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { getEnv } from '../../common/utils/env';
import { FootballTeamEntity } from '../../database/models/football-team.entity';
import { MatchEntity } from '../../database/models/match.entity';
import { PredictionEntity } from '../../database/models/prediction.entity';
import { QuinielaEntity } from '../../database/models/quiniela.entity';
import { CreateFootballTeamDto } from './dto/create-football-team.dto';
import { CreateMatchDto } from './dto/create-match.dto';
import { SetResultDto } from './dto/set-result.dto';

const STAGE_POINTS: Record<string, number> = {
  octavos: 1,
  cuartos: 2,
  semifinal: 3,
  tercer_lugar: 2,
  final: 4,
};

@Injectable()
export class AdminService {
  private readonly matchRepo: Repository<MatchEntity>;
  private readonly predictionRepo: Repository<PredictionEntity>;
  private readonly quinielaRepo: Repository<QuinielaEntity>;
  private readonly footballTeamRepo: Repository<FootballTeamEntity>;

  constructor(@InjectDataSource(getEnv('DB_NAME')) private readonly ds: DataSource) {
    this.matchRepo = ds.getRepository(MatchEntity);
    this.predictionRepo = ds.getRepository(PredictionEntity);
    this.quinielaRepo = ds.getRepository(QuinielaEntity);
    this.footballTeamRepo = ds.getRepository(FootballTeamEntity);
  }

  async createFootballTeam(dto: CreateFootballTeamDto): Promise<FootballTeamEntity> {
    return this.footballTeamRepo.save(this.footballTeamRepo.create(dto));
  }

  async listFootballTeams(): Promise<FootballTeamEntity[]> {
    return this.footballTeamRepo.find({ order: { name: 'ASC' } });
  }

  async createMatch(dto: CreateMatchDto): Promise<MatchEntity> {
    const homeTeam = await this.footballTeamRepo.findOne({ where: { idFootballTeam: dto.homeTeamId } as any });
    if (!homeTeam) throw new NotFoundException(`Equipo local con id ${dto.homeTeamId} no encontrado.`);

    const awayTeam = await this.footballTeamRepo.findOne({ where: { idFootballTeam: dto.awayTeamId } as any });
    if (!awayTeam) throw new NotFoundException(`Equipo visitante con id ${dto.awayTeamId} no encontrado.`);

    const match = this.matchRepo.create({
      stage: dto.stage,
      homeTeamId: dto.homeTeamId,
      awayTeamId: dto.awayTeamId,
      matchDate: dto.matchDate ? new Date(dto.matchDate) : undefined,
      matchOrder: dto.matchOrder ?? 0,
      status: 'pending',
    });

    const saved = await this.matchRepo.save(match);
    return this.matchRepo.findOne({
      where: { idMatch: saved.idMatch } as any,
      relations: ['homeTeam', 'awayTeam'],
    }) as Promise<MatchEntity>;
  }

  async setResult(matchId: number, dto: SetResultDto): Promise<{ message: string; pointsAwarded: number }> {
    const match = await this.matchRepo.findOne({
      where: { idMatch: matchId } as any,
      relations: ['homeTeam', 'awayTeam'],
    });
    if (!match) throw new NotFoundException(`Partido con id ${matchId} no encontrado.`);
    if (match.status === 'finished') throw new BadRequestException('Este partido ya tiene un resultado registrado.');

    if (dto.winnerId !== Number(match.homeTeamId) && dto.winnerId !== Number(match.awayTeamId)) {
      throw new BadRequestException(
        `El id ${dto.winnerId} no corresponde a ninguno de los equipos del partido (${match.homeTeam.name} vs ${match.awayTeam.name}).`,
      );
    }

    match.winnerId = dto.winnerId;
    match.status = 'finished';
    await this.matchRepo.save(match);

    const points = STAGE_POINTS[match.stage] ?? 1;

    const predictions = await this.predictionRepo.find({ where: { matchId } as any });
    const quinielaScoreDelta = new Map<number, number>();

    for (const pred of predictions) {
      const isCorrect = Number(pred.predictedWinnerId) === dto.winnerId;
      pred.isCorrect = isCorrect;
      if (isCorrect) {
        const prev = quinielaScoreDelta.get(Number(pred.quinielaId)) ?? 0;
        quinielaScoreDelta.set(Number(pred.quinielaId), prev + points);
      }
    }

    if (predictions.length) await this.predictionRepo.save(predictions);

    for (const [quinielaId, delta] of quinielaScoreDelta.entries()) {
      await this.quinielaRepo
        .createQueryBuilder()
        .update(QuinielaEntity)
        .set({ score: () => `nu_score + ${delta}` })
        .where('id_quiniela = :id', { id: quinielaId })
        .execute();
    }

    return {
      message: `Resultado registrado: ${match.homeTeam.name} vs ${match.awayTeam.name} — ganador: ${dto.winnerId}`,
      pointsAwarded: points,
    };
  }

  async listMatches(): Promise<MatchEntity[]> {
    return this.matchRepo.find({
      relations: ['homeTeam', 'awayTeam', 'winner'],
      order: { matchOrder: 'ASC' },
    });
  }
}
