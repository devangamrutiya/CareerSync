import { ResumeOptimizerService } from './resume-optimizer.service';
import type { Request, Response } from 'express';
import type { AcceptedChanges } from './types/resume.types';
export declare class ResumeOptimizerController {
    private service;
    constructor(service: ResumeOptimizerService);
    analyze(req: Request & {
        user: {
            id: string;
        };
    }, file: Express.Multer.File, jdText: string): Promise<{
        runId: string;
        status: string;
    }>;
    getRun(req: Request & {
        user: {
            id: string;
        };
    }, runId: string): Promise<{
        run: {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        };
        resume: import("./types/resume.types").ResumeJson | null;
        jobDescription: import("./types/resume.types").JobDescriptionJson | null;
        analysis: import("./types/resume.types").GapAnalysisJson | null;
        suggestions: import("./types/resume.types").ResumeSuggestionsJson | null;
        finalResume: {
            data: import("./types/resume.types").ResumeJson;
            pdfUrl: string | null;
            docxUrl: string | null;
        } | null;
    }>;
    applyChanges(req: Request & {
        user: {
            id: string;
        };
    }, runId: string, accepted: AcceptedChanges): Promise<{
        status: string;
        finalResume: import("./types/resume.types").ResumeJson;
    }>;
    exportResume(req: Request & {
        user: {
            id: string;
        };
    }, runId: string, format: string, res: Response): Promise<void>;
}
