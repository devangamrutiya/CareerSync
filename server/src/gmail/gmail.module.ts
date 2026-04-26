import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { GeminiModule } from '../gemini/gemini.module';
import { GmailController } from './gmail.controller';
import { GmailService } from './gmail.service';

@Module({
  imports: [UsersModule, PrismaModule, GeminiModule],
  controllers: [GmailController],
  providers: [GmailService],
})
export class GmailModule {}
