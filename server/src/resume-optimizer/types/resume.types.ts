// ─── ResumeJson ───────────────────────────────────────────

export type ResumeBasics = {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
};

export type ResumeSkills = {
  technical: string[];
  tools: string[];
  soft?: string[];
};

export type ResumeExperience = {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  bullets: string[];
};

export type ResumeProject = {
  id: string;
  name: string;
  techStack?: string[];
  bullets: string[];
  link?: string;
};

export type ResumeEducation = {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  score?: string;
};

export type ResumeCertification = {
  id: string;
  name: string;
  issuer?: string;
  date?: string;
};

export type ResumeJson = {
  basics: ResumeBasics;
  summary: string;
  skills: ResumeSkills;
  experience: ResumeExperience[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  certifications?: ResumeCertification[];
};

// ─── JobDescriptionJson ───────────────────────────────────

export type JobDescriptionJson = {
  title: string;
  company?: string;
  location?: string;
  employmentType?: string;
  seniority?: string;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  responsibilities: string[];
  qualifications: string[];
  keywords: string[];
  tools: string[];
  experienceRequired?: string;
  educationRequired?: string;
};

// ─── GapAnalysisJson ──────────────────────────────────────

export type SectionToImprove = {
  section: 'summary' | 'skills' | 'experience' | 'projects';
  reason: string;
};

export type ExperienceBulletCandidate = {
  experienceId: string;
  bulletIndex: number;
  reason: string;
  targetKeywords: string[];
};

export type GapAnalysisJson = {
  overallMatchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  gaps: string[];
  sectionsToImprove: SectionToImprove[];
  experienceBulletCandidates: ExperienceBulletCandidate[];
  warnings: string[];
};

// ─── ResumeSuggestionsJson ────────────────────────────────

export type SummarySuggestion = {
  original: string;
  suggested: string;
  reason: string;
};

export type SkillsSuggestion = {
  original: ResumeSkills;
  suggested: ResumeSkills;
  reason: string;
};

export type ExperienceSuggestion = {
  experienceId: string;
  originalBullets: string[];
  suggestedBullets: string[];
  reasons: string[];
};

export type ProjectSuggestion = {
  projectId: string;
  originalBullets: string[];
  suggestedBullets: string[];
  reasons: string[];
};

export type ResumeSuggestionsJson = {
  summarySuggestion?: SummarySuggestion;
  skillsSuggestion?: SkillsSuggestion;
  experienceSuggestions: ExperienceSuggestion[];
  projectSuggestions: ProjectSuggestion[];
  missingKeywords: string[];
  warnings: string[];
};

// ─── Run status ───────────────────────────────────────────

export type ResumeRunStatus =
  | 'uploaded'
  | 'parsed'
  | 'analyzed'
  | 'suggested'
  | 'reviewed'
  | 'finalized'
  | 'exported'
  | 'failed';

// ─── Accept/Reject payload ────────────────────────────────

export type AcceptedChanges = {
  summary?: boolean;
  skills?: boolean;
  experience?: Array<{ experienceId: string; accepted: boolean }>;
  projects?: Array<{ projectId: string; accepted: boolean }>;
};
