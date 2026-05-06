"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ResumesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const gemini_service_1 = require("../gemini/gemini.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pdfParseModule = __importStar(require("pdf-parse"));
const mammoth_1 = __importDefault(require("mammoth"));
const sanitize_resume_for_export_1 = require("../resume-optimizer/logic/sanitize-resume-for-export");
const export_pdf_1 = require("../resume-optimizer/render/export-pdf");
function readFileAsBuffer(filePath) {
    return fs.readFileSync(filePath);
}
function sanitizeText(s) {
    return s.replace(/\r\n/g, '\n').replace(/\t/g, ' ').trim();
}
function normalizeOptimizedResumeFormat(raw) {
    const lines = raw
        .replace(/```[\s\S]*?```/g, '')
        .split(/\r?\n/)
        .map((line) => line.trimRight());
    const sectionTitlePattern = /^[A-Z][A-Z\s&/()-]{2,}$/;
    const cleaned = [];
    for (const originalLine of lines) {
        const line = originalLine.trim();
        if (!line) {
            if (cleaned.at(-1) !== '')
                cleaned.push('');
            continue;
        }
        if (/^[+\-]\s+/.test(line)) {
            cleaned.push(line.replace(/^[+\-]\s+/, '* '));
            continue;
        }
        if (/^#{3,}\s+/.test(line)) {
            cleaned.push(`**${(0, sanitize_resume_for_export_1.sanitizeAtsString)(line.replace(/^#{3,}\s+/, ''))}**`);
            continue;
        }
        if (!line.startsWith('#') && sectionTitlePattern.test(line)) {
            cleaned.push(`## ${(0, sanitize_resume_for_export_1.sanitizeAtsString)(line)}`);
            continue;
        }
        cleaned.push(line);
    }
    return cleaned.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
function mergeUniqueTerms(base, additions) {
    const existing = base
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    const seen = new Set(existing.map((v) => v.toLowerCase()));
    for (const item of additions) {
        const key = item.toLowerCase();
        if (!seen.has(key)) {
            existing.push(item);
            seen.add(key);
        }
    }
    return existing.join(', ');
}
function extractJobDescriptionKeywords(jobDescription) {
    const lines = jobDescription
        .split(/\r?\n/)
        .map((line) => (0, sanitize_resume_for_export_1.sanitizeAtsString)(line).replace(/[.:;]+$/g, '').trim())
        .filter(Boolean);
    const leadInPattern = /\b(strong knowledge of|knowledge of|experience with|familiarity with|familiar with|strong understanding of|understanding of|proficient in|skills|tech stack|tools)\b/i;
    const noiseTerms = new Set([
        'and',
        'or',
        'with',
        'using',
        'within',
        'across',
        'the',
        'a',
        'an',
        'of',
        'to',
        'for',
        'in',
        'on',
        'developer',
        'application',
        'applications',
        'responsible',
        'responsibilities',
        'maintain',
        'support',
        'quality',
        'code',
        'design',
        'build',
        'develop',
        'development',
    ]);
    const candidates = [];
    for (const line of lines) {
        if (!leadInPattern.test(line) && !line.includes(',') && !line.includes('/')) {
            continue;
        }
        const normalizedLine = line
            .replace(/\b(strong knowledge of|knowledge of|experience with|familiarity with|familiar with|strong understanding of|understanding of|proficient in)\b/gi, '')
            .replace(/\b(its limitations|weaknesses|workarounds)\b/gi, '')
            .trim();
        const parts = normalizedLine
            .split(/,|\/|\band\b|\bas well as\b|;/i)
            .map((v) => v.trim())
            .filter(Boolean);
        for (const part of parts) {
            const term = part
                .replace(/^[^a-zA-Z0-9+#.]+|[^a-zA-Z0-9+#.)]+$/g, '')
                .replace(/[()]/g, '')
                .trim();
            if (!term || term.length < 2 || term.length > 40)
                continue;
            if (noiseTerms.has(term.toLowerCase()))
                continue;
            const isLikelyKeyword = /[+#.]/.test(term) ||
                /\b[A-Z]{2,}\b/.test(term) ||
                /^[A-Za-z]+(?:\s+[A-Za-z]+){0,2}$/.test(term);
            if (!isLikelyKeyword)
                continue;
            candidates.push(term);
        }
    }
    const deduped = [];
    const seen = new Set();
    for (const term of candidates) {
        const key = term.toLowerCase();
        if (seen.has(key))
            continue;
        seen.add(key);
        deduped.push(term);
    }
    return deduped.slice(0, 20);
}
function ensureJobDescriptionKeywords(optimizedText, jobDescription) {
    const required = extractJobDescriptionKeywords(jobDescription);
    if (required.length === 0)
        return optimizedText;
    const lowerOptimized = optimizedText.toLowerCase();
    const missing = required.filter((kw) => !lowerOptimized.includes(kw.toLowerCase()));
    if (missing.length === 0)
        return optimizedText;
    const toAdd = missing.slice(0, 8);
    const lines = optimizedText.split(/\r?\n/);
    const skillsHeadingIdx = lines.findIndex((line) => /^(##\s*)?(skills|technical skills|core competencies|additional information)\b/i.test(line.trim()));
    if (skillsHeadingIdx === -1) {
        return `${optimizedText}\n\n## Skills\n**Relevant Keywords:** ${toAdd.join(', ')}`.trim();
    }
    let skillsEndIdx = lines.length;
    for (let i = skillsHeadingIdx + 1; i < lines.length; i += 1) {
        const t = lines[i].trim();
        if (/^##\s+/.test(t) || /^[A-Z][A-Z\s&/()-]{2,}$/.test(t)) {
            skillsEndIdx = i;
            break;
        }
    }
    const sectionLines = lines.slice(skillsHeadingIdx + 1, skillsEndIdx);
    const techLineIdx = sectionLines.findIndex((line) => /^\s*\*?\*?\s*(technical skills|programming languages)\s*:/i.test(line));
    if (techLineIdx >= 0) {
        const absoluteIdx = skillsHeadingIdx + 1 + techLineIdx;
        const line = lines[absoluteIdx];
        const parts = line.split(':');
        const head = parts.shift() || '**Technical Skills**';
        const tail = parts.join(':').trim();
        lines[absoluteIdx] = `${head}: ${mergeUniqueTerms(tail, toAdd)}`;
    }
    else {
        lines.splice(skillsEndIdx, 0, `**Relevant Keywords:** ${toAdd.join(', ')}`);
    }
    return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
async function extractTextFromPdf(filePath) {
    const pdfBuffer = readFileAsBuffer(filePath);
    try {
        const pdfParseFn = pdfParseModule
            .default;
        const fn = (pdfParseFn ?? pdfParseModule);
        const data = await fn(pdfBuffer);
        return data.text ?? '';
    }
    catch {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
        const loadingTask = pdfjs.getDocument({
            data: new Uint8Array(pdfBuffer),
        });
        const document = await loadingTask.promise;
        const pagesText = [];
        for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
            const page = await document.getPage(pageNumber);
            const textContent = await page.getTextContent();
            const line = textContent.items
                .map((item) => {
                const maybe = item;
                return maybe.str ?? '';
            })
                .join(' ');
            pagesText.push(line);
        }
        return pagesText.join('\n');
    }
}
function markdownToHtml(text) {
    const lines = text.split(/\r?\n/);
    const htmlParts = [];
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const bold = (s) => esc(s).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    for (const raw of lines) {
        const line = raw.trim();
        if (!line) {
            htmlParts.push('<br/>');
        }
        else if (line.match(/^###\s+/)) {
            htmlParts.push(`<h3>${bold(line.replace(/^###\s+/, ''))}</h3>`);
        }
        else if (line.match(/^##\s+/)) {
            htmlParts.push(`<h2>${bold(line.replace(/^##\s+/, ''))}</h2>`);
        }
        else if (line.match(/^#\s+/)) {
            htmlParts.push(`<h1>${bold(line.replace(/^#\s+/, ''))}</h1>`);
        }
        else if (line.match(/^[\*\-]\s+/)) {
            htmlParts.push(`<li>${bold(line.replace(/^[\*\-]\s+/, ''))}</li>`);
        }
        else {
            htmlParts.push(`<p>${bold(line)}</p>`);
        }
    }
    let html = htmlParts.join('\n');
    html = html.replace(/(<li>.*?<\/li>\n?)+/gs, (match) => `<ul>${match}</ul>`);
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @page { margin: 14mm 16mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #1a1a1a;
    padding: 12px 8px 24px;
    max-width: 800px;
    margin: 0 auto;
  }
  h1 { font-size: 22pt; font-weight: 700; margin-top: 10px; margin-bottom: 4px; color: #111; text-align: center; }
  h2 {
    font-size: 12pt; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.5px; color: #111; border-bottom: 1.5px solid #333;
    padding-bottom: 3px; margin-top: 18px; margin-bottom: 8px;
  }
  h3 { font-size: 11pt; font-weight: 600; margin-top: 10px; margin-bottom: 2px; }
  p { margin-bottom: 4px; font-size: 10.5pt; }
  ul { padding-left: 18px; margin-top: 4px; margin-bottom: 8px; }
  li { font-size: 10.5pt; margin-bottom: 2px; }
  strong { font-weight: 600; color: #111; }
  br { display: block; margin-bottom: 4px; content: ""; }
</style>
</head>
<body>
${html}
</body>
</html>`;
}
let ResumesService = ResumesService_1 = class ResumesService {
    prisma;
    gemini;
    logger = new common_1.Logger(ResumesService_1.name);
    errorMessage(error) {
        return error instanceof Error ? error.message : 'unknown error';
    }
    constructor(prisma, gemini) {
        this.prisma = prisma;
        this.gemini = gemini;
    }
    async optimizeResume(input) {
        const { userId, uploadedFile, jobDescription } = input;
        const filePath = uploadedFile.path;
        const storageRoot = path.join(process.cwd(), 'uploads', 'resumes');
        const originalUrl = path
            .join('/uploads', 'resumes', uploadedFile.filename)
            .replaceAll('\\', '/');
        try {
            const resumeRow = await this.prisma.resume.create({
                data: {
                    originalFileUrl: originalUrl,
                    userId,
                },
            });
            const ext = path.extname(uploadedFile.originalname).toLowerCase();
            let resumeText = '';
            if (ext === '.pdf') {
                try {
                    resumeText = await extractTextFromPdf(filePath);
                }
                catch (error) {
                    this.logger.warn(`PDF parsing failed for user ${userId}: ${this.errorMessage(error)}`);
                    throw new common_1.BadRequestException('Unable to read the uploaded PDF resume');
                }
            }
            else if (ext === '.docx') {
                try {
                    const result = await mammoth_1.default.extractRawText({ path: filePath });
                    resumeText = result.value;
                }
                catch (error) {
                    this.logger.warn(`DOCX parsing failed for user ${userId}: ${this.errorMessage(error)}`);
                    throw new common_1.BadRequestException('Unable to read the uploaded DOCX resume');
                }
            }
            else {
                throw new common_1.BadRequestException('Only PDF/DOCX resumes are supported');
            }
            resumeText = sanitizeText(resumeText);
            if (!resumeText) {
                throw new common_1.BadRequestException('Could not extract text from resume');
            }
            const optimized = await this.gemini.optimizeResumeForJob({
                resumeText,
                jobDescription,
            });
            const optimizedText = sanitizeText(optimized?.optimizedText || '');
            if (!optimizedText) {
                throw new common_1.BadGatewayException('Resume optimization service returned empty content.');
            }
            const normalizedResume = normalizeOptimizedResumeFormat(optimizedText);
            const jdAlignedResume = ensureJobDescriptionKeywords(normalizedResume, jobDescription);
            const html = markdownToHtml(jdAlignedResume);
            const pdfBytes = await (0, export_pdf_1.exportPdf)(html);
            const updatedFilename = `${resumeRow.id}_optimized.pdf`;
            const outPath = path.join(storageRoot, updatedFilename);
            fs.mkdirSync(path.dirname(outPath), { recursive: true });
            fs.writeFileSync(outPath, pdfBytes);
            const updatedUrl = path
                .join('/uploads', 'resumes', updatedFilename)
                .replaceAll('\\', '/');
            await this.prisma.resume.update({
                where: { id: resumeRow.id },
                data: { updatedFileUrl: updatedUrl },
            });
            return pdfBytes;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            this.logger.error(`Resume optimize failed for user ${userId}: ${this.errorMessage(error)}`);
            throw new common_1.InternalServerErrorException('Unable to optimize resume at this time.');
        }
        finally {
            fs.promises.unlink(filePath).catch(() => {
            });
        }
    }
};
exports.ResumesService = ResumesService;
exports.ResumesService = ResumesService = ResumesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        gemini_service_1.GeminiService])
], ResumesService);
//# sourceMappingURL=resumes.service.js.map