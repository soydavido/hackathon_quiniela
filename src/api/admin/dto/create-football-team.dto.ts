import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateFootballTeamDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  countryCode!: string;

  @IsNotEmpty()
  @IsUrl()
  flagUrl!: string;
}
