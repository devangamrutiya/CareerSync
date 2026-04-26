import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../gemini/gemini.service';
export type OptimizedResumeInput = {
    userId: string;
    uploadedFile: Express.Multer.File;
    jobDescription: string;
};
export declare class ResumesService {
    private prisma;
    private gemini;
    private readonly logger;
    private errorMessage;
    constructor(prisma: PrismaService, gemini: GeminiService);
    optimizeResume(input: OptimizedResumeInput): Promise<Buffer>;
}
