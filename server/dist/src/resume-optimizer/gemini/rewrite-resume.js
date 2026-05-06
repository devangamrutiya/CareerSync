"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewriteResume = rewriteResume;
const gemini_resume_client_1 = require("./gemini-resume.client");
const SYSTEM_PROMPT = `Generate targeted resume improvement suggestions.

Rules:
- Rewrite only summary, skills ordering, and selected experience/project bullets.
- Do not invent companies, titles, tools, dates, responsibilities, certifications, or metrics.
- Only use skills, tools, and technologies that already exist in the resume OR are standard industry terms for the candidate's existing role.
- Improve ATS alignment and clarity.
- Keep content concise and resume-appropriate.
- Provide a clear reason for every change.
- Return structured JSON only.
- Every string you output must be plain ATS text: no markdown (#, ##, **, [text](url)), no leading hash characters.
- In skillsSuggestion.suggested, order technical then tools so items that match the job description mustHaveSkills or keywords (when they already exist in the original resume) appear first; do not add skills that are not grounded in the original resume.

Return ONLY valid JSON matching this exact schema:
{
  "summarySuggestion": {
    "original": string,
    "suggested": string,
    "reason": string
  } | null,
  "skillsSuggestion": {
    "original": { "technical": string[], "tools": string[], "soft": string[] },
    "suggested": { "technical": string[], "tools": string[], "soft": string[] },
    "reason": string
  } | null,
  "experienceSuggestions": [
    {
      "experienceId": string,
      "originalBullets": string[],
      "suggestedBullets": string[],
      "reasons": string[]
    }
  ],
  "projectSuggestions": [
    {
      "projectId": string,
      "originalBullets": string[],
      "suggestedBullets": string[],
      "reasons": string[]
    }
  ],
  "missingKeywords": string[],
  "warnings": string[]
}`;
async function rewriteResume(input) {
    const ai = (0, gemini_resume_client_1.getGeminiClient)();
    const userText = [
        'PARSED RESUME:',
        JSON.stringify(input.resume, null, 2),
        '',
        'PARSED JOB DESCRIPTION:',
        JSON.stringify(input.jobDescription, null, 2),
        '',
        'GAP ANALYSIS:',
        JSON.stringify(input.analysis, null, 2),
    ].join('\n');
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: userText }] }],
        config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            temperature: 0.4,
        },
    });
    if (!response.text) {
        throw new Error('Gemini returned empty response for rewrite suggestions');
    }
    return JSON.parse(response.text);
}
//# sourceMappingURL=rewrite-resume.js.map