import { Controller, Get, Logger } from '@nestjs/common';
import { FootballTeamsService } from './football-teams.service';

@Controller('football-teams')
export class FootballTeamsController {
  protected readonly logger = new Logger(FootballTeamsController.name);

  constructor(private readonly footballTeamsService: FootballTeamsService) {}

  @Get()
  async list() {
    return this.footballTeamsService.listAll();
  }
}
