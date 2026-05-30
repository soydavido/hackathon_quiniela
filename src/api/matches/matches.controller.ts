import { Controller, Get, Logger } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  protected readonly logger = new Logger(MatchesController.name);

  constructor(private readonly matchesService: MatchesService) {}

  // Lista plana — útil para la vista en tabla
  @Get()
  async list() {
    return this.matchesService.listAll();
  }

  // Bracket completo con TBD para rondas sin armar — útil para la vista gráfica
  @Get('bracket')
  async bracket() {
    return this.matchesService.getFullBracket();
  }
}
