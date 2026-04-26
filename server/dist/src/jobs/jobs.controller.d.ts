import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobsService } from './jobs.service';
export declare class JobsController {
    private jobsService;
    constructor(jobsService: JobsService);
    list(req: any): Promise<{
        id: string;
        companyName: string;
        jobTitle: string;
        status: string;
        appliedDate: Date;
        sourceEmailId: string | null;
        userId: string;
    }[]>;
    create(req: any, dto: CreateJobDto): Promise<{
        id: string;
        companyName: string;
        jobTitle: string;
        status: string;
        appliedDate: Date;
        sourceEmailId: string | null;
        userId: string;
    }>;
    get(req: any, id: string): Promise<{
        id: string;
        companyName: string;
        jobTitle: string;
        status: string;
        appliedDate: Date;
        sourceEmailId: string | null;
        userId: string;
    }>;
    update(req: any, id: string, dto: UpdateJobDto): Promise<{
        id: string;
        companyName: string;
        jobTitle: string;
        status: string;
        appliedDate: Date;
        sourceEmailId: string | null;
        userId: string;
    }>;
    delete(req: any, id: string): Promise<{
        ok: boolean;
    }>;
}
