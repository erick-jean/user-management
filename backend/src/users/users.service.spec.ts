import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ConflictException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersService: UsersService;

  const prismaMock = {
    user: {
      findUnique: jest.fn<(args: unknown) => Promise<{ id: number } | null>>(),
      create: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    usersService = new UsersService(prismaMock as unknown as PrismaService);
  });

  describe('create', () => {
    it('deve impedir a criação quando o e-mail já estiver cadastrado', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
      });

      const createUserDto = {
        name: 'John Doe',
        email: 'john@email.com',
        password: 'StrongPass123',
      };

      await expect(usersService.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: 'john@email.com',
        },
        select: {
          id: true,
        },
      });

      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });
});
