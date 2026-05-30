import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateParticipantDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsUrl({}, { message: 'El campo photoUrl debe ser una URL válida.' })
  @MaxLength(500)
  photoUrl?: string;
}
