import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { getEnv } from '../../common/utils/env';
import { FootballTeamEntity } from '../../database/models/football-team.entity';
import { MatchEntity } from '../../database/models/match.entity';
import { ParticipantEntity } from '../../database/models/participant.entity';
import { PredictionEntity } from '../../database/models/prediction.entity';
import { QuinielaEntity } from '../../database/models/quiniela.entity';
import { formatMatchSlot, formatTeam, STAGE_ORDER, STAGE_SLOTS } from '../matches/matches.service';
import { SaveQuinielaDto } from './dto/submit-quiniela.dto';

@Injectable()
export class QuinielaService {
  private readonly quinielaRepo: Repository<QuinielaEntity>;
  private readonly predictionRepo: Repository<PredictionEntity>;
  private readonly participantRepo: Repository<ParticipantEntity>;
  private readonly matchRepo: Repository<MatchEntity>;
  private readonly footballTeamRepo: Repository<FootballTeamEntity>;

  constructor(@InjectDataSource(getEnv('DB_NAME')) private readonly ds: DataSource) {
    this.quinielaRepo = ds.getRepository(QuinielaEntity);
    this.predictionRepo = ds.getRepository(PredictionEntity);
    this.participantRepo = ds.getRepository(ParticipantEntity);
    this.matchRepo = ds.getRepository(MatchEntity);
    this.footballTeamRepo = ds.getRepository(FootballTeamEntity);
  }

  async save(teamId: number, dto: SaveQuinielaDto): Promise<{ message: string }> {
    const participant = await this.participantRepo.findOne({
      where: { idParticipant: dto.participantId, teamId } as any,
    });
    if (!participant) throw new NotFoundException('Participante no encontrado en este equipo.');

    const existing = await this.quinielaRepo.findOne({ where: { participantId: dto.participantId } as any });
    if (existing) throw new BadRequestException('Este participante ya registró su quiniela y no puede modificarla.');

    const matchIds = dto.predictions.map((p) => p.matchId);
    const [matches, allTeams] = await Promise.all([
      this.matchRepo.find({ where: { idMatch: In(matchIds) } }),
      this.footballTeamRepo.find({ select: ['idFootballTeam'] as any }),
    ]);
    const matchMap = new Map(matches.map((m) => [Number(m.idMatch), m]));
    const validTeamIds = new Set(allTeams.map((t) => Number(t.idFootballTeam)));

    for (const pred of dto.predictions) {
      const match = matchMap.get(pred.matchId);
      if (!match) throw new BadRequestException(`El partido con id ${pred.matchId} no existe.`);
      if (match.status === 'finished') throw new BadRequestException(`El partido con id ${pred.matchId} ya finalizó y no puede predecirse.`);

      if (match.homeTeamId && match.awayTeamId) {
        // Partido con equipos definidos: solo se acepta uno de los dos
        const validIds = [Number(match.homeTeamId), Number(match.awayTeamId)];
        if (!validIds.includes(pred.predictedWinnerId)) {
          throw new BadRequestException(
            `El equipo con id ${pred.predictedWinnerId} no juega en el partido ${pred.matchId}. Equipos válidos: ${validIds.join(', ')}.`,
          );
        }
      } else {
        // Partido placeholder (equipos aún por definir): acepta cualquier equipo del torneo
        if (!validTeamIds.has(pred.predictedWinnerId)) {
          throw new BadRequestException(
            `El equipo con id ${pred.predictedWinnerId} no existe en el torneo.`,
          );
        }
      }
    }

    const quiniela = this.quinielaRepo.create({ participantId: dto.participantId, submitted: true, score: 0 });
    await this.quinielaRepo.save(quiniela);

    await this.predictionRepo.save(
      dto.predictions.map((pred) =>
        this.predictionRepo.create({
          quinielaId: quiniela.idQuiniela,
          matchId: pred.matchId,
          predictedWinnerId: pred.predictedWinnerId,
        }),
      ),
    );

    return { message: 'Quiniela registrada exitosamente.' };
  }

  async getByParticipant(participantId: number, teamId: number): Promise<any> {
    const participant = await this.participantRepo.findOne({
      where: { idParticipant: participantId, teamId } as any,
    });
    if (!participant) throw new NotFoundException('Participante no encontrado en este equipo.');

    const quiniela = await this.quinielaRepo.findOne({
      where: { participantId } as any,
      relations: ['predictions', 'predictions.predictedWinner'],
    });
    if (!quiniela) throw new NotFoundException('Este participante no tiene quiniela registrada.');

    const allMatches = await this.matchRepo.find({
      relations: ['homeTeam', 'awayTeam', 'winner'],
      order: { matchOrder: 'ASC' },
    });

    const byStage = new Map<string, MatchEntity[]>();
    for (const m of allMatches) {
      if (!byStage.has(m.stage)) byStage.set(m.stage, []);
      byStage.get(m.stage)!.push(m);
    }

    const predMap = new Map((quiniela.predictions ?? []).map((p) => [Number(p.matchId), p]));

    const TBD_WITH_NULL_PRED = {
      idMatch: null,
      matchOrder: null,
      homeTeam: null,
      awayTeam: null,
      matchDate: null,
      status: 'tbd',
      winner: null,
      prediction: null,
    };

    const bracket = STAGE_ORDER.map((stage) => {
      const matches = byStage.get(stage) ?? [];
      const slots = STAGE_SLOTS[stage];
      const result: any[] = [];
      for (let i = 0; i < slots; i++) {
        if (!matches[i]) {
          result.push({ ...TBD_WITH_NULL_PRED });
          continue;
        }
        const m = matches[i];
        const pred = predMap.get(Number(m.idMatch)) ?? null;
        result.push({
          ...formatMatchSlot(m),
          prediction: pred
            ? {
                idPrediction: pred.idPrediction,
                predictedWinner: formatTeam(pred.predictedWinner),
                isCorrect: pred.isCorrect ?? null,
              }
            : null,
        });
      }
      return { stage, matches: result };
    });

    return {
      participant: { idParticipant: participant.idParticipant, name: participant.name },
      submitted: quiniela.submitted,
      score: quiniela.score,
      bracket,
    };
  }

  async getResultsByToken(teamId: number): Promise<any[]> {
    const participants = await this.participantRepo.find({ where: { teamId } as any });
    if (!participants.length) return [];

    const participantIds = participants.map((p) => p.idParticipant);
    const participantMap = new Map(participants.map((p) => [Number(p.idParticipant), p]));

    const quinielas = await this.quinielaRepo.find({
      where: { participantId: In(participantIds) } as any,
      relations: ['predictions', 'predictions.match', 'predictions.match.homeTeam', 'predictions.match.awayTeam', 'predictions.match.winner', 'predictions.predictedWinner'],
    });

    return quinielas.map((q) => this.formatResults(q, participantMap.get(Number(q.participantId))));
  }

  async getResultsByParticipant(participantId: number, teamId: number): Promise<any> {
    const participant = await this.participantRepo.findOne({
      where: { idParticipant: participantId, teamId } as any,
    });
    if (!participant) throw new NotFoundException('Participante no encontrado en este equipo.');

    const quiniela = await this.quinielaRepo.findOne({
      where: { participantId } as any,
      relations: ['predictions', 'predictions.match', 'predictions.match.homeTeam', 'predictions.match.awayTeam', 'predictions.match.winner', 'predictions.predictedWinner'],
    });
    if (!quiniela) throw new NotFoundException('Este participante no tiene quiniela registrada.');

    return this.formatResults(quiniela, participant);
  }

  private formatResults(q: QuinielaEntity, participant: ParticipantEntity | undefined): any {
    const totalMatches = q.predictions?.length ?? 0;
    const correct = q.predictions?.filter((p) => p.isCorrect === true).length ?? 0;
    const pending = q.predictions?.filter((p) => p.isCorrect === null || p.isCorrect === undefined).length ?? 0;

    return {
      participant: {
        idParticipant: participant?.idParticipant,
        name: participant?.name,
      },
      submitted: q.submitted,
      score: q.score,
      stats: {
        totalPredictions: totalMatches,
        correct,
        incorrect: totalMatches - correct - pending,
        pending,
      },
      predictions: (q.predictions ?? [])
        .sort((a, b) => Number(a.matchId) - Number(b.matchId))
        .map((p) => ({
          idPrediction: p.idPrediction,
          predictedWinner: p.predictedWinner
            ? { idFootballTeam: p.predictedWinner.idFootballTeam, name: p.predictedWinner.name, flagUrl: p.predictedWinner.flagUrl }
            : null,
          isCorrect: p.isCorrect ?? null,
          match: p.match ? {
            idMatch: p.match.idMatch,
            stage: p.match.stage,
            homeTeam: p.match.homeTeam ? { idFootballTeam: p.match.homeTeam.idFootballTeam, name: p.match.homeTeam.name, flagUrl: p.match.homeTeam.flagUrl } : null,
            awayTeam: p.match.awayTeam ? { idFootballTeam: p.match.awayTeam.idFootballTeam, name: p.match.awayTeam.name, flagUrl: p.match.awayTeam.flagUrl } : null,
            status: p.match.status,
            winner: p.match.winner ? { idFootballTeam: p.match.winner.idFootballTeam, name: p.match.winner.name, flagUrl: p.match.winner.flagUrl } : null,
          } : null,
        })),
    };
  }
}
