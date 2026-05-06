"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GeminiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const genai_1 = require("@google/genai");
let GeminiService = GeminiService_1 = class GeminiService {
    logger = new common_1.Logger(GeminiService_1.name);
    ai;
    geminiModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    groqModel = process.env.LLM_MODEL || process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    minIntervalMs = Number(process.env.LLM_MIN_INTERVAL_MS || 12_000);
    lastCallAt = {
        gemini: 0,
        groq: 0,
    };
    geminiDisabledDueHardQuota = false;
    MAX_RETRIES = 3;
    BASE_DELAY_MS = 2_000;
    constructor() {
        this.ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
        this.logger.log(`LLM provider priority: ${this.providerOrder().join(' -> ')}`);
    }
    errorMessage(error) {
        return error instanceof Error ? error.message : 'unknown error';
    }
    isRetryable(error) {
        const msg = error instanceof Error ? error.message : JSON.stringify(error);
        if (this.isHardQuotaExceeded(error)) {
            return false;
        }
        return (/503|UNAVAILABLE|overloaded|high demand|429|RESOURCE_EXHAUSTED|rate.limit|timeout|ECONNRESET/i.test(msg));
    }
    isHardQuotaExceeded(error) {
        const msg = error instanceof Error ? error.message : JSON.stringify(error);
        return (/quota exceeded/i.test(msg) &&
            /limit:\s*0|check your plan and billing details|free_tier|insufficient_quota/i.test(msg));
    }
    shouldDisableGeminiAfterError(error) {
        if (this.isHardQuotaExceeded(error))
            return true;
        const msg = error instanceof Error ? error.message : JSON.stringify(error);
        if (!/limit:\s*0/i.test(msg))
            return false;
        return /generativelanguage|gemini|generate_content|free_tier/i.test(msg);
    }
    disableGeminiIfHardQuota(error, provider) {
        if (provider !== 'gemini' || this.geminiDisabledDueHardQuota)
            return;
        if (!this.shouldDisableGeminiAfterError(error))
            return;
        this.geminiDisabledDueHardQuota = true;
        this.logger.warn('Gemini skipped for the remainder of this server process: hard quota or zero limit on the API project. ' +
            'Groq will be used when configured. Restart the server after fixing Gemini billing/quotas to try Gemini again.');
    }
    providerOrder() {
        const configured = (process.env.LLM_PROVIDER_PRIORITY || 'gemini,groq')
            .split(',')
            .map((v) => v.trim().toLowerCase())
            .filter((v) => v === 'gemini' || v === 'groq');
        const unique = Array.from(new Set(configured));
        if (unique.length === 0)
            return ['gemini', 'groq'];
        if (!unique.includes('gemini'))
            unique.push('gemini');
        if (!unique.includes('groq'))
            unique.push('groq');
        return unique;
    }
    isProviderEnabled(provider) {
        if (provider === 'gemini') {
            return (Boolean(process.env.GEMINI_API_KEY) && !this.geminiDisabledDueHardQuota);
        }
        return Boolean(process.env.GROQ_API_KEY);
    }
    async waitForProviderSlot(provider) {
        if (!Number.isFinite(this.minIntervalMs) || this.minIntervalMs <= 0)
            return;
        const now = Date.now();
        const elapsed = now - this.lastCallAt[provider];
        const waitMs = this.minIntervalMs - elapsed;
        if (waitMs > 0) {
            this.logger.warn(`Pacing ${provider} requests to avoid RPM limit. Waiting ${waitMs}ms before next call.`);
            await new Promise((r) => setTimeout(r, waitMs));
        }
        this.lastCallAt[provider] = Date.now();
    }
    async generateViaGroq(system, userText, temperature, responseFormat) {
        const apiKey = process.env.GROQ_API_KEY || '';
        if (!apiKey) {
            throw new Error('GROQ_API_KEY is missing; cannot call Groq.');
        }
        const body = {
            model: this.groqModel,
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: userText },
            ],
            temperature,
        };
        if (responseFormat === 'json_object') {
            body.response_format = { type: 'json_object' };
        }
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body),
        });
        const data = (await response.json());
        if (!response.ok) {
            throw new Error(data?.error?.message || `Groq API error: HTTP ${response.status}`);
        }
        const text = data?.choices?.[0]?.message?.content?.trim() || '';
        if (!text) {
            throw new Error('Empty response from Groq model');
        }
        return text;
    }
    async generateViaGemini(args) {
        await this.waitForProviderSlot('gemini');
        const response = await this.ai.models.generateContent({
            model: this.geminiModel,
            contents: [{ role: 'user', parts: [{ text: args.userText }] }],
            config: {
                systemInstruction: args.system,
                responseMimeType: args.responseMimeType,
                temperature: args.temperature,
            },
        });
        if (!response.text) {
            throw new Error('Empty response from model');
        }
        return response.text;
    }
    async generateContent(args) {
        let lastError;
        for (const provider of this.providerOrder()) {
            if (!this.isProviderEnabled(provider)) {
                continue;
            }
            try {
                if (provider === 'gemini') {
                    return await this.generateViaGemini(args);
                }
                await this.waitForProviderSlot('groq');
                return await this.generateViaGroq(args.system, args.userText, args.temperature, args.responseMimeType === 'application/json' ? 'json_object' : undefined);
            }
            catch (error) {
                lastError = error;
                this.disableGeminiIfHardQuota(error, provider);
                this.logger.warn(`Provider ${provider} failed. Trying next provider if available. Error: ${this.errorMessage(error)}`);
            }
        }
        if (lastError) {
            throw lastError;
        }
        throw new Error('No LLM provider is configured. Set GEMINI_API_KEY or GROQ_API_KEY.');
    }
    async withRetry(label, fn) {
        let lastError;
        for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
            try {
                return await fn();
            }
            catch (error) {
                lastError = error;
                if (!this.isRetryable(error) || attempt === this.MAX_RETRIES) {
                    break;
                }
                const delay = this.retryDelayMs(error, attempt);
                this.logger.warn(`${label} attempt ${attempt}/${this.MAX_RETRIES} failed (retryable). ` +
                    `Retrying in ${delay}ms… Error: ${this.errorMessage(error)}`);
                await new Promise((r) => setTimeout(r, delay));
            }
        }
        throw lastError;
    }
    retryDelayMs(error, attempt) {
        const fallback = this.BASE_DELAY_MS * Math.pow(2, attempt - 1);
        const msg = error instanceof Error ? error.message : JSON.stringify(error);
        const retryInSeconds = msg.match(/retry in\s+(\d+(?:\.\d+)?)s/i);
        if (!retryInSeconds)
            return fallback;
        const parsed = Number(retryInSeconds[1]);
        if (!Number.isFinite(parsed) || parsed <= 0)
            return fallback;
        return Math.max(fallback, Math.ceil(parsed * 1000));
    }
    async extractJobFromEmail(emailText) {
        const system = [
            'You extract job application signals from emails.',
            'Return ONLY strict JSON with keys: companyName, jobTitle, status.',
            'Analyze the email subject and content closely to determine the exact stage of the application.',
            'For the "status" field, be descriptive and use specific values based on the email context, such as:',
            '- "Shortlisted" (for application shortlisted)',
            '- "Interview Scheduled", "Virtual Interview", or "Interaction Scheduled" (for initial scheduling and invitations)',
            '- "2nd Round Interview", "3rd Round Interview", or "Practical Interview" (if the email mentions cleared rounds, moving to the next round, or specific practical steps)',
            '- "Offer", "Rejected", or "Ghosted".',
            'If it just mentions applying without mentioning an interview, use "Applied".',
            'If unknown, set status to "Applied".',
            'If you cannot infer companyName or jobTitle, return {"companyName":"","jobTitle":"","status":"Applied"}.',
        ].join('\n');
        try {
            return await this.withRetry('extractJobFromEmail', async () => {
                const responseText = await this.generateContent({
                    system,
                    userText: emailText,
                    responseMimeType: 'application/json',
                    temperature: 0.2,
                });
                const data = JSON.parse(responseText);
                const companyName = (data.companyName || '').trim();
                const jobTitle = (data.jobTitle || '').trim();
                const status = (data.status || 'Applied').trim() || 'Applied';
                if (!companyName || !jobTitle)
                    return null;
                return { companyName, jobTitle, status };
            });
        }
        catch (error) {
            this.logger.warn(`Gemini API extraction failed after ${this.MAX_RETRIES} attempts: ${this.errorMessage(error)}`);
            throw new common_1.ServiceUnavailableException('AI service is temporarily unavailable. Please try again in a moment.');
        }
    }
    async optimizeResumeForJob(input) {
        const system = [
            'You are an ATS Resume Optimization Assistant specialized in MNC hiring standards.',
            'Rewrite the candidate resume to align strongly with the provided job description while keeping all information truthful and section-aware.',
            'Prioritize exact and closely related JD keywords (skills, tools, responsibilities, domain terms, certifications, and soft skills).',
            'Output must be ATS-friendly, recruiter-friendly, concise, and impact-driven.',
            'OUTPUT RULES:',
            '1. Return ONLY raw Markdown resume content.',
            '2. Do NOT return JSON.',
            '3. Do NOT include conversational text, explanations, notes, or code fences.',
            '4. Keep formatting clean and professional.',
            '5. Preserve the candidate original section structure and section names whenever possible.',
            '6. If the original resume contains sections such as Certifications, Projects, Achievements, or Additional Information, keep them in the optimized output.',
            '7. Do not drop meaningful sections from the original resume unless they are empty or clearly irrelevant.',
            '8. Use Markdown headings for sections (prefer "## Section Name").',
            '9. Do NOT use "###" or deeper headings; use bold text for sub-labels instead.',
            'WORK EXPERIENCE RULES:',
            '1. Use reverse-chronological order (newest role first).',
            '2. For each role include: Job Title | Company | Location | Date Range.',
            '3. Under each role, use bullet points for responsibilities and achievements.',
            '4. Start bullets with strong action verbs.',
            '5. Include measurable impact where possible (%, time saved, scale, quality, performance).',
            '6. Use present tense for current role and past tense for previous roles.',
            'SKILLS RULES:',
            '1. Do NOT use a vertical bulleted list of individual skills.',
            '2. Group skills by category on single lines only.',
            '3. Example: "**Technical Skills:** C#, .NET Core, ASP.NET Core, SQL Server, REST APIs".',
            '4. Include only relevant skills aligned to the target JD.',
            'ATS + MNC QUALITY RULES:',
            '1. Use standard job titles and common industry terminology.',
            '2. Remove repetitive, weak, or irrelevant content.',
            '3. Emphasize ownership, cross-functional collaboration, scalability, reliability, and business impact.',
            '4. Ensure important JD keywords are represented naturally in the final resume when relevant, especially in Skills and Work Experience.',
            'TRUTHFULNESS CONSTRAINT:',
            'Do not invent experience. If a JD requirement is missing, emphasize transferable strengths from existing resume content.',
            'FORMAT CONSISTENCY RULES:',
            '1. Use "*" bullets only under Work Experience.',
            '2. Do not use "+" bullets.',
            '3. Keep output easy to parse by ATS and easy to scan by recruiters.',
            '4. Keep section order close to the candidate original resume order, with improved readability.',
            '5. Skills should be grouped by category lines (not one-skill-per-bullet).',
        ].join('\n');
        const user = [
            'JOB_DESCRIPTION:',
            input.jobDescription,
            '',
            'RESUME_TEXT:',
            input.resumeText,
        ].join('\n');
        try {
            return await this.withRetry('optimizeResumeForJob', async () => {
                const responseText = await this.generateContent({
                    system,
                    userText: user,
                    temperature: 0.3,
                });
                return { optimizedText: responseText.trim() };
            });
        }
        catch (error) {
            this.logger.warn(`Gemini API optimize resume failed after ${this.MAX_RETRIES} attempts: ${this.errorMessage(error)}`);
            if (this.isHardQuotaExceeded(error)) {
                throw new common_1.HttpException('Gemini API quota is exhausted or not enabled for this project. Check API key project, billing, and Gemini quotas, then retry.', common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            throw new common_1.BadGatewayException('Gemini is temporarily unavailable due to high demand. Please try again in a minute.');
        }
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = GeminiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map