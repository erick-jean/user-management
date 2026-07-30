import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaMssql } from '@prisma/adapter-mssql';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService) {
    const adapter = new PrismaMssql({
      server: configService.getOrThrow<string>('DB_HOST'),
      port: Number(configService.getOrThrow<string>('DB_PORT')),
      database: configService.getOrThrow<string>('DB_DATABASE'),
      user: configService.getOrThrow<string>('DB_USERNAME'),
      password: configService.getOrThrow<string>('MSSQL_SA_PASSWORD'),

      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    });

    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
