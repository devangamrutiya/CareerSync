import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
export declare class JobsService {
    private prisma;
    constructor(prisma: PrismaService);
    listForUser(userId: string): Promise<{
        id: string;
        companyName: string;
        jobTitle: string;
        status: string;
        appliedDate: Date;
        sourceEmailId: string | null;
        userId: string;
    }[]>;
    createForUser(userId: string, dto: CreateJobDto): Promise<{
        id: string;
        companyName: string;
        jobTitle: string;
        status: string;
        appliedDate: Date;
        sourceEmailId: string | null;
        userId: string;
    }>;
    getForUser(userId: string, jobId: string): Promise<{
        id: string;
        companyName: string;
        jobTitle: string;
        status: string;
        appliedDate: Date;
        sourceEmailId: string | null;
        userId: string;
    }>;
    updateForUser(userId: string, jobId: string, dto: UpdateJobDto): Promise<{
        id: string;
        companyName: string;
        jobTitle: string;
        status: string;
        appliedDate: Date;
        sourceEmailId: string | null;
        userId: string;
    }>;
    deleteForUser(userId: string, jobId: string): Promise<{
        ok: boolean;
    }>;
}
