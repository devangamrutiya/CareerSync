import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async listForUser(userId: string) {
    return this.prisma.job.findMany({
      where: { userId },
      orderBy: { appliedDate: 'desc' },
    });
  }

  async createForUser(userId: string, dto: CreateJobDto) {
    return this.prisma.job.create({
      data: {
        companyName: dto.companyName,
        jobTitle: dto.jobTitle,
        status: dto.status ?? 'Applied',
        appliedDate: dto.appliedDate ? new Date(dto.appliedDate) : undefined,
        userId,
      },
    });
  }

  async getForUser(userId: string, jobId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, userId },
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async updateForUser(userId: string, jobId: string, dto: UpdateJobDto) {
    await this.getForUser(userId, jobId);
    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        ...(dto.companyName ? { companyName: dto.companyName } : {}),
        ...(dto.jobTitle ? { jobTitle: dto.jobTitle } : {}),
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.appliedDate ? { appliedDate: new Date(dto.appliedDate) } : {}),
      },
    });
  }

  async deleteForUser(userId: string, jobId: string) {
    await this.getForUser(userId, jobId);
    await this.prisma.job.delete({ where: { id: jobId } });
    return { ok: true };
  }
}
