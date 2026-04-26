import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { GmailModule } from './gmail/gmail.module';
import { GeminiModule } from './gemini/gemini.module';
import { ResumesModule } from './resumes/resumes.module';
import { ResumeOptimizerModule } from './resume-optimizer/resume-optimizer.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    JobsModule,
    GeminiModule,
    GmailModule,
    ResumesModule,
    ResumeOptimizerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
