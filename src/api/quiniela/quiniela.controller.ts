import { Body, Controller, Get, Logger, Param, Post, Req } from '@nestjs/common';
import { QuinielaService } from './quiniela.service';
import { SaveQuinielaDto } from './dto/submit-quiniela.dto';

@Controller('quiniela')
export class QuinielaController {
  protected readonly logger = new Logger(QuinielaController.name);

  constructor(private readonly quinielaService: QuinielaService) {}

  @Post()
  async save(@Body() dto: SaveQuinielaDto, @Req() req: any) {
    return this.quinielaService.save(req.team.idTeam, dto);
  }

  // Resultados de todas las quinielas del equipo (token)
  @Get('results')
  async resultsByToken(@Req() req: any) {
    return this.quinielaService.getResultsByToken(req.team.idTeam);
  }

  // Resultados de la quiniela de un participante específico
  @Get('results/:participantId')
  async resultsByParticipant(@Param('participantId') id: string, @Req() req: any) {
    return this.quinielaService.getResultsByParticipant(Number(id), req.team.idTeam);
  }

  @Get(':participantId')
  async getByParticipant(@Param('participantId') id: string, @Req() req: any) {
    return this.quinielaService.getByParticipant(Number(id), req.team.idTeam);
  }
}
