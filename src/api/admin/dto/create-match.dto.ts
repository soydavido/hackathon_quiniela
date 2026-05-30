import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import type { MatchStage } from '../../../database/models/match.entity';

export class CreateMatchDto {
  @IsIn(['octavos', 'cuartos', 'semifinal', 'tercer_lugar', 'final'])
  stage!: MatchStage;

  @IsInt()
  @Type(() => Number)
  homeTeamId!: number;

  @IsInt()
  @Type(() => Number)
  awayTeamId!: number;

  @IsOptional()
  @IsDateString()
  matchDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  matchOrder?: number;
}
