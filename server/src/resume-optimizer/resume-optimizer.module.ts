import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ResumeOptimizerController } from './resume-optimizer.controller';
import { ResumeOptimizerService } from './resume-optimizer.service';

@Module({
  imports: [PrismaModule],
  controllers: [ResumeOptimizerController],
  providers: [ResumeOptimizerService],
})
export class ResumeOptimizerModule {}
