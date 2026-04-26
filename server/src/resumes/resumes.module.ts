import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GeminiModule } from '../gemini/gemini.module';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';

@Module({
  imports: [PrismaModule, GeminiModule],
  controllers: [ResumesController],
  providers: [ResumesService],
})
export class ResumesModule {}
