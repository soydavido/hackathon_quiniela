import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { BaseService } from '../../common/services/base.service';
import { ParticipantEntity } from '../../database/models/participant.entity';
import { QuinielaEntity } from '../../database/models/quiniela.entity';
import { getEnv } from '../../common/utils/env';
import { CreateParticipantDto } from './dto/create-participant.dto';

@Injectable()
export class ParticipantsService extends BaseService<ParticipantEntity> {
  private readonly quinielaRepo: Repository<QuinielaEntity>;

  constructor(@InjectDataSource(getEnv('DB_NAME')) private readonly ds: DataSource) {
    super(ds.getRepository(ParticipantEntity));
    this.quinielaRepo = ds.getRepository(QuinielaEntity);
  }

  async createForTeam(teamId: number, dto: CreateParticipantDto): Promise<ParticipantEntity> {
    const existing = await this.repository.findOne({ where: { teamId, name: dto.name } as any });
    if (existing) throw new BadRequestException(`Ya existe un participante con el nombre "${dto.name}" en este equipo.`);
    return this.create({ name: dto.name, teamId, photoUrl: dto.photoUrl });
  }

  async listByTeam(teamId: number): Promise<any[]> {
    const participants = await this.repository.find({ where: { teamId } as any, order: { createdAt: 'ASC' } });
    const ids = participants.map((p) => p.idParticipant);
    if (!ids.length) return [];

    const quinielas = await this.quinielaRepo.find({
      where: { participantId: In(ids) } as any,
      select: ['participantId', 'submitted'] as any,
    });

    const quinielaMap = new Map(quinielas.map((q) => [Number(q.participantId), q]));

    return participants.map((p) => {
      const q = quinielaMap.get(Number(p.idParticipant));
      return {
        idParticipant: p.idParticipant,
        name: p.name,
        photoUrl: p.photoUrl ?? null,
        teamId: p.teamId,
        quinielaSubmitted: q?.submitted ?? false,
        createdAt: p.createdAt,
      };
    });
  }

  async getQuinielaByParticipant(participantId: number, teamId: number): Promise<QuinielaEntity | null> {
    const participant = await this.repository.findOne({ where: { idParticipant: participantId, teamId } as any });
    if (!participant) throw new BadRequestException('Participante no encontrado en este equipo.');

    return this.quinielaRepo.findOne({
      where: { participantId } as any,
      relations: ['predictions', 'predictions.match'],
    });
  }
}
