import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUserDto, ListUserFilterDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type UserRecord = {
  id: number;
  name: string;
  email: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<ListUserDto> {
    const email = createUserDto.email?.trim().toLowerCase();

    if (!email) {
      throw new BadRequestException('O e-mail e obrigatorio.');
    }

    const userExists = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (userExists) {
      throw new ConflictException('Este e-mail ja esta em uso.');
    }

    try {
      const passwordHash = await hash(createUserDto.password, 10);
      const user = await this.prisma.user.create({
        data: {
          name: createUserDto.name.trim(),
          email,
          passwordHash,
          active: createUserDto.status !== 'inativo',
        },
        select: this.userSelect(),
      });

      return this.toListUserDto(user);
    } catch {
      throw new InternalServerErrorException(
        'Ocorreu um erro ao criar o usuario.',
      );
    }
  }

  async findAll(filter?: ListUserFilterDto): Promise<ListUserDto[]> {
    const users = await this.prisma.user.findMany({
      where: {
        active: this.resolveActiveFilter(filter),
      },
      select: this.userSelect(),
      orderBy: {
        id: 'asc',
      },
    });

    return users.map((user) => this.toListUserDto(user));
  }

  async findOne(id: number): Promise<ListUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect(),
    });

    if (!user) {
      throw new NotFoundException(`Usuario com ID ${id} nao encontrado`);
    }

    return this.toListUserDto(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<ListUserDto> {
    if (!id) {
      throw new BadRequestException('O ID do usuario e obrigatorio.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`Usuario com ID ${id} nao encontrado`);
    }

    const email = updateUserDto.email?.trim().toLowerCase();

    if (email) {
      const userWithEmail = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException('Este e-mail ja esta em uso.');
      }
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          name: updateUserDto.name?.trim(),
          email,
          active: this.resolveUpdatedActive(updateUserDto),
        },
        select: this.userSelect(),
      });

      return this.toListUserDto(updatedUser);
    } catch {
      throw new InternalServerErrorException(
        'Ocorreu um erro ao atualizar o usuario.',
      );
    }
  }

  private resolveActiveFilter(filter?: ListUserFilterDto): boolean | undefined {
    if (filter?.status === 'ativo') {
      return true;
    }

    if (filter?.status === 'inativo') {
      return false;
    }

    return undefined;
  }

  private resolveUpdatedActive(
    updateUserDto: UpdateUserDto,
  ): boolean | undefined {
    if (updateUserDto.status === 'ativo') {
      return true;
    }

    if (updateUserDto.status === 'inativo') {
      return false;
    }

    return undefined;
  }

  private toListUserDto(user: UserRecord): ListUserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.active ? 'ativo' : 'inativo',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private userSelect() {
    return {
      id: true,
      name: true,
      email: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    } as const;
  }
}
