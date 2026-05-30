import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsPositive, ValidateNested } from 'class-validator';

export class PredictionItemDto {
  @IsInt()
  @Type(() => Number)
  matchId!: number;

  @IsInt()
  @IsPositive({ message: 'predictedWinnerId debe ser un ID de equipo válido.' })
  @Type(() => Number)
  predictedWinnerId!: number;
}

export class SaveQuinielaDto {
  @IsInt()
  @Type(() => Number)
  participantId!: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos una predicción.' })
  @ValidateNested({ each: true })
  @Type(() => PredictionItemDto)
  predictions!: PredictionItemDto[];
}

