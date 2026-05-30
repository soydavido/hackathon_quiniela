import { Body, Controller, Get, Headers, Logger, Param, Patch, Post, UnauthorizedException } from '@nestjs/common';
import { getEnv } from '../../common/utils/env';
import { AdminService } from './admin.service';
import { CreateFootballTeamDto } from './dto/create-football-team.dto';
import { CreateMatchDto } from './dto/create-match.dto';
import { SetResultDto } from './dto/set-result.dto';

@Controller('admin')
export class AdminController {
  protected readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  private validateAdminToken(headers: any) {
    const token = headers['x-admin-token'];
    if (!token || token !== getEnv('ADMIN_SECRET')) {
      throw new UnauthorizedException('Token de administrador inválido.');
    }
  }

  @Post('football-teams')
  async createFootballTeam(@Body() dto: CreateFootballTeamDto, @Headers() headers: any) {
    this.validateAdminToken(headers);
    return this.adminService.createFootballTeam(dto);
  }

  @Get('football-teams')
  async listFootballTeams(@Headers() headers: any) {
    this.validateAdminToken(headers);
    return this.adminService.listFootballTeams();
  }

  @Post('matches')
  async createMatch(@Body() dto: CreateMatchDto, @Headers() headers: any) {
    this.validateAdminToken(headers);
    return this.adminService.createMatch(dto);
  }

  @Get('matches')
  async listMatches(@Headers() headers: any) {
    this.validateAdminToken(headers);
    return this.adminService.listMatches();
  }

  @Patch('matches/:id/result')
  async setResult(@Param('id') id: string, @Body() dto: SetResultDto, @Headers() headers: any) {
    this.validateAdminToken(headers);
    return this.adminService.setResult(Number(id), dto);
  }
}
