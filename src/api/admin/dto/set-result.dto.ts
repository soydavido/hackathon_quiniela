import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class SetResultDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  winnerId!: number;
}
