import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import type { UserStatus } from './get-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'status'] as const),
) {
  @ApiPropertyOptional({ example: 'inativo', enum: ['ativo', 'inativo'] })
  @IsOptional()
  @IsIn(['ativo', 'inativo'], {
    message: 'O status deve ser ativo ou inativo',
  })
  status?: UserStatus;
}
