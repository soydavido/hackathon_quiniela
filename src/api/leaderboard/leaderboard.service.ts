import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { getEnv } from '../../common/utils/env';
import { ParticipantEntity } from '../../database/models/participant.entity';
import { PredictionEntity } from '../../database/models/prediction.entity';
import { QuinielaEntity } from '../../database/models/quiniela.entity';
import { STAGE_POINTS } from '../matches/matches.service';

function computeScore(predictions: PredictionEntity[]): number {
  return predictions.reduce((sum, pred) => {
    const match = pred.match;
    if (!match || match.status !== 'finished' || match.winnerId == null) return sum;
    const correct = Number(pred.predictedWinnerId) === Number(match.winnerId);
    return sum + (correct ? (STAGE_POINTS[match.stage] ?? 1) : 0);
  }, 0);
}

@Injectable()
export class LeaderboardService {
  private readonly quinielaRepo: Repository<QuinielaEntity>;
  private readonly participantRepo: Repository<ParticipantEntity>;

  constructor(@InjectDataSource(getEnv('DB_NAME')) private readonly ds: DataSource) {
    this.quinielaRepo = ds.getRepository(QuinielaEntity);
    this.participantRepo = ds.getRepository(ParticipantEntity);
  }

  async getByToken(teamId: number): Promise<any[]> {
    const participants = await this.participantRepo.find({ where: { teamId } as any });
    if (!participants.length) return [];

    const ids = participants.map((p) => p.idParticipant);
    const quinielas = await this.quinielaRepo.find({
      where: { participantId: In(ids) } as any,
      relations: ['predictions', 'predictions.match'],
    });

    const quinielaMap = new Map(quinielas.map((q) => [Number(q.participantId), q]));

    return participants
      .map((p) => {
        const q = quinielaMap.get(Number(p.idParticipant));
        return {
          idParticipant: p.idParticipant,
          name: p.name,
          photoUrl: p.photoUrl ?? null,
          score: q ? computeScore(q.predictions ?? []) : 0,
          submitted: q?.submitted ?? false,
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  async getGeneral(): Promise<any[]> {
    const quinielas = await this.quinielaRepo.find({
      relations: ['participant', 'participant.team', 'predictions', 'predictions.match'],
    });

    return quinielas
      .map((q) => ({
        idParticipant: q.participantId,
        name: q.participant?.name,
        photoUrl: q.participant?.photoUrl ?? null,
        teamName: q.participant?.team?.name,
        score: computeScore(q.predictions ?? []),
        submitted: q.submitted,
      }))
      .sort((a, b) => b.score - a.score);
  }
}
