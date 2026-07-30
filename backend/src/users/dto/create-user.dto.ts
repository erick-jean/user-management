import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'john@email.com' })
  @IsEmail(
    {},
    {
      message: 'Informe um e-mail valido',
    },
  )
  @MaxLength(255)
  @IsNotEmpty({
    message: 'O e-mail e obrigatorio',
  })
  email!: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString()
  @MinLength(8, {
    message: 'A senha deve possuir no minimo 8 caracteres',
  })
  @MaxLength(255, {
    message: 'A senha deve possuir no maximo 255 caracteres',
  })
  password!: string;

  @ApiProperty({
    example: 'ativo',
    enum: ['ativo', 'inativo'],
    required: false,
  })
  @IsOptional()
  @IsIn(['ativo', 'inativo'], {
    message: 'O status deve ser ativo ou inativo',
  })
  status?: 'ativo' | 'inativo';
}
