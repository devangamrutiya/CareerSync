import type { ResumeJson, JobDescriptionJson, GapAnalysisJson } from '../types/resume.types';
export declare function analyzeGap(input: {
    resume: ResumeJson;
    jobDescription: JobDescriptionJson;
}): Promise<GapAnalysisJson>;
