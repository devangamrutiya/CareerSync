import { PrismaService } from '../prisma/prisma.service';
import type { ResumeJson, JobDescriptionJson, GapAnalysisJson, ResumeSuggestionsJson, AcceptedChanges } from './types/resume.types';
export declare class ResumeOptimizerService {
    private prisma;
    private readonly logger;
    private errorMessage;
    constructor(prisma: PrismaService);
    analyze(input: {
        userId: string;
        uploadedFile: Express.Multer.File;
        jdText: string;
    }): Promise<{
        runId: string;
        status: string;
    }>;
    getRun(runId: string, userId: string): Promise<{
        run: {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        };
        resume: ResumeJson | null;
        jobDescription: JobDescriptionJson | null;
        analysis: GapAnalysisJson | null;
        suggestions: ResumeSuggestionsJson | null;
        finalResume: {
            data: ResumeJson;
            pdfUrl: string | null;
            docxUrl: string | null;
        } | null;
    }>;
    applyAccepted(runId: string, userId: string, accepted: AcceptedChanges): Promise<{
        status: string;
        finalResume: ResumeJson;
    }>;
    exportResume(runId: string, userId: string, format: 'pdf' | 'docx'): Promise<{
        buffer: Buffer;
        contentType: string;
        filename: string;
    }>;
}
