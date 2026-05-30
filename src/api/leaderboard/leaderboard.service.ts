import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { getEnv } from '../../common/utils/env';
import { ParticipantEntity } from '../../database/models/participant.entity';
import { QuinielaEntity } from '../../database/models/quiniela.entity';

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
    });

    const quinielaMap = new Map(quinielas.map((q) => [Number(q.participantId), q]));

    return participants
      .map((p) => {
        const q = quinielaMap.get(Number(p.idParticipant));
        return {
          idParticipant: p.idParticipant,
          name: p.name,
          photoUrl: p.photoUrl ?? null,
          score: q?.score ?? 0,
          submitted: q?.submitted ?? false,
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  async getGeneral(): Promise<any[]> {
    const quinielas = await this.quinielaRepo.find({
      relations: ['participant', 'participant.team'],
    });

    return quinielas
      .map((q) => ({
        idParticipant: q.participantId,
        name: q.participant?.name,
        photoUrl: q.participant?.photoUrl ?? null,
        teamName: q.participant?.team?.name,
        score: q.score,
        submitted: q.submitted,
      }))
      .sort((a, b) => b.score - a.score);
  }
}
