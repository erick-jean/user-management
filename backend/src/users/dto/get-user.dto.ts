import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export type UserStatus = 'ativo' | 'inativo';

export class ListUserDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador do usuario',
  })
  id!: number;

  @ApiProperty({
    example: 'Ana Souza',
    description: 'Nome completo do usuario',
  })
  name!: string;

  @ApiProperty({
    example: 'ana.souza@example.com',
    description: 'E-mail do usuario',
  })
  email!: string;

  @ApiProperty({
    example: 'ativo',
    enum: ['ativo', 'inativo'],
    description: 'Status do usuario',
  })
  status!: UserStatus;

  @ApiProperty({
    example: '2026-07-28T14:30:00.000Z',
    description: 'Data de criacao',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-07-28T14:30:00.000Z',
    description: 'Data da ultima atualizacao',
  })
  updatedAt!: Date;
}

export class ListUserFilterDto {
  @ApiPropertyOptional({
    enum: ['ativo', 'inativo'],
    description: 'Filtra usuarios por status',
  })
  @IsOptional()
  @IsIn(['ativo', 'inativo'])
  status?: UserStatus;
}
