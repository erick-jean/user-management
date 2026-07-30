import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],

  controllers: [AppController],
})
export class AppModule {}
