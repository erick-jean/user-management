import { ApiProperty } from '@nestjs/swagger';

export class ListUserDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador do usuário',
  })
  id!: number;

  @ApiProperty({
    example: 'Ana Souza',
    description: 'Nome completo do usuário',
  })
  name!: string;

  @ApiProperty({
    example: 'ana.souza@example.com',
    description: 'E-mail do usuário',
  })
  email!: string;

  @ApiProperty({
    example: true,
    description: 'Indica se o usuário está ativo',
  })
  active!: boolean;

  @ApiProperty({
    example: '2026-07-28T14:30:00.000Z',
    description: 'Data de criação',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-07-28T14:30:00.000Z',
    description: 'Data da última atualização',
  })
  updatedAt!: Date;
}
