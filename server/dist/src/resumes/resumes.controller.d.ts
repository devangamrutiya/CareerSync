import { ResumesService } from './resumes.service';
import type { Request, Response } from 'express';
export declare class ResumesController {
    private resumesService;
    constructor(resumesService: ResumesService);
    optimize(req: Request & {
        user: {
            id: string;
        };
    }, file: Express.Multer.File, jobDescription: string, res: Response): Promise<void>;
}
