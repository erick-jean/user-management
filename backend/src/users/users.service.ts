import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
// import { UpdateUserDto } from './dto/update-user.dto';
import { ListUserDto } from './dto/get-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { hash } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Cria um novo usuário no banco de dados
  async create(createUserDto: CreateUserDto) {
    const email = createUserDto.email?.trim().toLowerCase();

    // Valida se o e-mail foi fornecido
    if (!email) {
      throw new BadRequestException('O e-mail é obrigatório.');
    }

    const userExists = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    // Se o usuário já existe, lança uma exceção de conflito
    if (userExists) {
      throw new ConflictException('Este e-mail já está em uso.');
    }

    try {
      const passwordHash = await hash(createUserDto.password, 10);

      return await this.prisma.user.create({
        data: {
          name: createUserDto.name,
          email,
          passwordHash,
          active: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          active: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch {
      throw new InternalServerErrorException(
        'Ocorreu um erro ao criar o usuário.',
      );
    }
  }

  // Busca todos os usuários no banco de dados e retorna uma lista de objetos
  findAll(): Promise<ListUserDto[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  // Busca um usuário pelo ID no banco de dados e retorna o objeto correspondente
  async findOne(id: number): Promise<ListUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return user;
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
