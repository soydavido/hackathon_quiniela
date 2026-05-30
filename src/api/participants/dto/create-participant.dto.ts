import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateParticipantDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @IsString()
  @MaxLength(100)
  name!: string;
}
