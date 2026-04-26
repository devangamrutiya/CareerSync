import type { ResumeJson, JobDescriptionJson, GapAnalysisJson, ResumeSuggestionsJson } from '../types/resume.types';
export declare function rewriteResume(input: {
    resume: ResumeJson;
    jobDescription: JobDescriptionJson;
    analysis: GapAnalysisJson;
}): Promise<ResumeSuggestionsJson>;
