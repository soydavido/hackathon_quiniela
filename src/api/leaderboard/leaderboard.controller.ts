import { Controller, Get, Logger, Req } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  protected readonly logger = new Logger(LeaderboardController.name);

  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('token')
  async byToken(@Req() req: any) {
    return this.leaderboardService.getByToken(req.team.idTeam);
  }

  @Get('general')
  async general() {
    return this.leaderboardService.getGeneral();
  }
}
