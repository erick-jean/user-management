import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
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
      message: 'Informe um e-mail válido',
    },
  )
  @MaxLength(255)
  @IsNotEmpty({
    message: 'O e-mail é obrigatório',
  })
  email!: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString()
  @MinLength(8)
  @MaxLength(255, {
    message: 'O e-mail deve possuir no máximo 255 caracteres',
  })
  password!: string;
}
