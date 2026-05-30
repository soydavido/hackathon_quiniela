import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTeamDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  token!: string;
}
