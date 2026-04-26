import { getGeminiClient } from './gemini-resume.client';
import type { ResumeJson } from '../types/resume.types';

const SYSTEM_PROMPT = `You are a resume parser.
Extract the resume into the provided JSON schema.

Rules:
- Extract facts only.
- Do not infer missing employers, dates, tools, certifications, or metrics.
- Keep bullet points close to source wording where possible.
- If a field is missing, return empty string or empty array.
- Generate a unique id for each experience, project, education, and certification entry (use format exp_1, exp_2, proj_1, proj_2, edu_1, cert_1, etc).

Return ONLY valid JSON matching this exact schema:
{
  "basics": {
    "fullName": string,
    "email": string,
    "phone": string (optional),
    "location": string (optional),
    "linkedin": string (optional),
    "github": string (optional),
    "portfolio": string (optional)
  },
  "summary": string,
  "skills": {
    "technical": string[],
    "tools": string[],
    "soft": string[] (optional)
  },
  "experience": [
    {
      "id": string,
      "company": string,
      "title": string,
      "location": string (optional),
      "startDate": string,
      "endDate": string,
      "current": boolean (optional),
      "bullets": string[]
    }
  ],
  "projects": [
    {
      "id": string,
      "name": string,
      "techStack": string[] (optional),
      "bullets": string[],
      "link": string (optional)
    }
  ],
  "education": [
    {
      "id": string,
      "institution": string,
      "degree": string,
      "field": string (optional),
      "startDate": string (optional),
      "endDate": string (optional),
      "score": string (optional)
    }
  ],
  "certifications": [
    {
      "id": string,
      "name": string,
      "issuer": string (optional),
      "date": string (optional)
    }
  ]
}`;

export async function parseResume(
  resumeText: string,
): Promise<ResumeJson> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: resumeText }] }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  });

  if (!response.text) {
    throw new Error('Gemini returned empty response for resume parsing');
  }

  return JSON.parse(response.text) as ResumeJson;
}
