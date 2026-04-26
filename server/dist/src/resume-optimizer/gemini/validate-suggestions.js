"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSuggestions = validateSuggestions;
exports.validateNoDateMutation = validateNoDateMutation;
const gemini_resume_client_1 = require("./gemini-resume.client");
const SYSTEM_PROMPT = `Review the proposed suggestions against the source resume.

Return warnings for:
- invented skills not present in original resume
- invented tools not present in original resume
- changed dates
- changed company names
- unsupported metrics (numbers/percentages not in original)
- unsupported certifications
- changed job titles

Return ONLY valid JSON matching this schema:
{
  "warnings": [
    {
      "type": "invented_skill" | "invented_tool" | "changed_date" | "changed_company" | "unsupported_metric" | "unsupported_certification" | "changed_title",
      "detail": string,
      "severity": "high" | "medium" | "low"
    }
  ],
  "isValid": boolean
}`;
async function validateSuggestions(input) {
    const ai = (0, gemini_resume_client_1.getGeminiClient)();
    const userText = [
        'ORIGINAL RESUME:',
        JSON.stringify(input.originalResume, null, 2),
        '',
        'PROPOSED SUGGESTIONS:',
        JSON.stringify(input.suggestions, null, 2),
    ].join('\n');
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: userText }] }],
        config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            temperature: 0.1,
        },
    });
    if (!response.text) {
        return { warnings: [], isValid: true };
    }
    return JSON.parse(response.text);
}
function validateNoDateMutation(original, suggestions) {
    const warnings = [];
    for (const expSuggestion of suggestions.experienceSuggestions) {
        const origExp = original.experience.find((e) => e.id === expSuggestion.experienceId);
        if (!origExp) {
            warnings.push(`Experience suggestion references unknown id: ${expSuggestion.experienceId}`);
        }
    }
    for (const projSuggestion of suggestions.projectSuggestions) {
        const origProj = original.projects.find((p) => p.id === projSuggestion.projectId);
        if (!origProj) {
            warnings.push(`Project suggestion references unknown id: ${projSuggestion.projectId}`);
        }
    }
    return warnings;
}
//# sourceMappingURL=validate-suggestions.js.map