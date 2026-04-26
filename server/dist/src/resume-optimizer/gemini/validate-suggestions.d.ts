import type { ResumeJson, ResumeSuggestionsJson } from '../types/resume.types';
type ValidationWarning = {
    type: string;
    detail: string;
    severity: 'high' | 'medium' | 'low';
};
type ValidationResult = {
    warnings: ValidationWarning[];
    isValid: boolean;
};
export declare function validateSuggestions(input: {
    originalResume: ResumeJson;
    suggestions: ResumeSuggestionsJson;
}): Promise<ValidationResult>;
export declare function validateNoDateMutation(original: ResumeJson, suggestions: ResumeSuggestionsJson): string[];
export {};
