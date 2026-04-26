"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJobDescription = parseJobDescription;
const gemini_resume_client_1 = require("./gemini-resume.client");
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
async function parseJobDescription(jdText) {
    const ai = (0, gemini_resume_client_1.getGeminiClient)();
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
    return JSON.parse(response.text);
}
//# sourceMappingURL=parse-job-description.js.map