import 'dotenv/config';
import { hash } from 'bcryptjs';
import { PrismaMssql } from '@prisma/adapter-mssql';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaMssql({
  server: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 1433),
  database: process.env.DB_DATABASE ?? 'user_management',
  user: process.env.DB_USERNAME ?? 'sa',
  password: process.env.MSSQL_SA_PASSWORD,

  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
});

const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const passwordHash = await hash('Senha@123', 10);

  const users = [
    {
      name: 'Ana Souza',
      email: 'ana.souza@example.com',
    },
    {
      name: 'Bruno Oliveira',
      email: 'bruno.oliveira@example.com',
    },
    {
      name: 'Carla Mendes',
      email: 'carla.mendes@example.com',
    },
    {
      name: 'Daniel Santos',
      email: 'daniel.santos@example.com',
    },
    {
      name: 'Eduarda Lima',
      email: 'eduarda.lima@example.com',
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        name: user.name,
      },
      create: {
        name: user.name,
        email: user.email,
        passwordHash,
        active: true,
      },
    });
  }

  console.log('Seed concluído: 5 usuários cadastrados.');
}

main()
  .catch((error: unknown) => {
    console.error('Erro ao executar o seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
