import { Body, Controller, Get, Logger, NotFoundException, Param, Post, Req } from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { CreateParticipantDto } from './dto/create-participant.dto';

@Controller('participants')
export class ParticipantsController {
  protected readonly logger = new Logger(ParticipantsController.name);

  constructor(private readonly participantsService: ParticipantsService) {}

  @Post()
  async create(@Body() dto: CreateParticipantDto, @Req() req: any) {
    return this.participantsService.createForTeam(req.team.idTeam, dto);
  }

  @Get()
  async list(@Req() req: any) {
    return this.participantsService.listByTeam(req.team.idTeam);
  }

  @Get(':id/quiniela')
  async getQuiniela(@Param('id') id: string, @Req() req: any) {
    const quiniela = await this.participantsService.getQuinielaByParticipant(Number(id), req.team.idTeam);
    if (!quiniela) throw new NotFoundException('Este participante aún no tiene quiniela.');
    return quiniela;
  }
}
