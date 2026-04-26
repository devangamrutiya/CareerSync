"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeGap = analyzeGap;
const gemini_resume_client_1 = require("./gemini-resume.client");
const SYSTEM_PROMPT = `Compare the parsed resume and parsed job description.

Return:
- overall match score 0-100
- matched keywords
- missing keywords
- strengths
- gaps
- resume sections to improve
- experience bullets that should be rewritten

Rules:
- Base analysis only on provided JSON.
- Do not invent resume content.
- Be specific about which experience bullets need work and why.

Return ONLY valid JSON matching this exact schema:
{
  "overallMatchScore": number,
  "matchedKeywords": string[],
  "missingKeywords": string[],
  "strengths": string[],
  "gaps": string[],
  "sectionsToImprove": [
    {
      "section": "summary" | "skills" | "experience" | "projects",
      "reason": string
    }
  ],
  "experienceBulletCandidates": [
    {
      "experienceId": string,
      "bulletIndex": number,
      "reason": string,
      "targetKeywords": string[]
    }
  ],
  "warnings": string[]
}`;
async function analyzeGap(input) {
    const ai = (0, gemini_resume_client_1.getGeminiClient)();
    const userText = [
        'PARSED RESUME:',
        JSON.stringify(input.resume, null, 2),
        '',
        'PARSED JOB DESCRIPTION:',
        JSON.stringify(input.jobDescription, null, 2),
    ].join('\n');
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: userText }] }],
        config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            temperature: 0.2,
        },
    });
    if (!response.text) {
        throw new Error('Gemini returned empty response for gap analysis');
    }
    return JSON.parse(response.text);
}
//# sourceMappingURL=analyze-gap.js.map