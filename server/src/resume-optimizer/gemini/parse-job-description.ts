import { getGeminiClient } from './gemini-resume.client';
import type { JobDescriptionJson } from '../types/resume.types';

const SYSTEM_PROMPT = `You are a job description parser.
Extract the job description into the provided JSON schema.

Rules:
- Separate must-have skills from nice-to-have skills.
- Extract responsibilities and keyword phrases.
- Preserve technical terms exactly.
- Do not invent company details not present in the JD.
- If a field is missing, return empty string or empty array.

Return ONLY valid JSON matching this exact schema:
{
  "title": string,
  "company": string (optional),
  "location": string (optional),
  "employmentType": string (optional),
  "seniority": string (optional),
  "mustHaveSkills": string[],
  "niceToHaveSkills": string[],
  "responsibilities": string[],
  "qualifications": string[],
  "keywords": string[],
  "tools": string[],
  "experienceRequired": string (optional),
  "educationRequired": string (optional)
}`;

export async function parseJobDescription(
  jdText: string,
): Promise<JobDescriptionJson> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: jdText }] }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  });

  if (!response.text) {
    throw new Error('Gemini returned empty response for JD parsing');
  }

  return JSON.parse(response.text) as JobDescriptionJson;
}
