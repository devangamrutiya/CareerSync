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
var ResumeOptimizerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeOptimizerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pdfParseModule = __importStar(require("pdf-parse"));
const mammoth_1 = __importDefault(require("mammoth"));
const parse_resume_1 = require("./gemini/parse-resume");
const parse_job_description_1 = require("./gemini/parse-job-description");
const analyze_gap_1 = require("./gemini/analyze-gap");
const rewrite_resume_1 = require("./gemini/rewrite-resume");
const validate_suggestions_1 = require("./gemini/validate-suggestions");
const merge_accepted_changes_1 = require("./logic/merge-accepted-changes");
const sanitize_resume_for_export_1 = require("./logic/sanitize-resume-for-export");
const prioritize_skills_by_jd_1 = require("./logic/prioritize-skills-by-jd");
const render_resume_html_1 = require("./render/render-resume-html");
const export_pdf_1 = require("./render/export-pdf");
const export_docx_1 = require("./render/export-docx");
function readFileAsBuffer(filePath) {
    return fs.readFileSync(filePath);
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
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(pdfBuffer) });
        const document = await loadingTask.promise;
        const pagesText = [];
        for (let i = 1; i <= document.numPages; i++) {
            const page = await document.getPage(i);
            const textContent = await page.getTextContent();
            const line = textContent.items
                .map((item) => item.str ?? '')
                .join(' ');
            pagesText.push(line);
        }
        return pagesText.join('\n');
    }
}
async function extractTextFromFile(filePath, originalname) {
    const ext = path.extname(originalname).toLowerCase();
    if (ext === '.pdf') {
        return extractTextFromPdf(filePath);
    }
    if (ext === '.docx') {
        const result = await mammoth_1.default.extractRawText({ path: filePath });
        return result.value;
    }
    throw new common_1.BadRequestException('Only PDF/DOCX resumes are supported');
}
let ResumeOptimizerService = ResumeOptimizerService_1 = class ResumeOptimizerService {
    prisma;
    logger = new common_1.Logger(ResumeOptimizerService_1.name);
    errorMessage(error) {
        return error instanceof Error ? error.message : 'unknown error';
    }
    constructor(prisma) {
        this.prisma = prisma;
    }
    async analyze(input) {
        const { userId, uploadedFile, jdText } = input;
        const filePath = uploadedFile.path;
        const storageRoot = path.join(process.cwd(), 'uploads', 'resumes');
        const originalUrl = path
            .join('/uploads', 'resumes', uploadedFile.filename)
            .replaceAll('\\', '/');
        const run = await this.prisma.resumeRun.create({
            data: {
                userId,
                originalResumeFileUrl: originalUrl,
                originalJdText: jdText,
                status: 'uploaded',
            },
        });
        try {
            const resumeText = await extractTextFromFile(filePath, uploadedFile.originalname);
            if (!resumeText.trim()) {
                throw new common_1.BadRequestException('Could not extract text from resume');
            }
            this.logger.log(`[${run.id}] Parsing resume...`);
            const parsedResume = (0, sanitize_resume_for_export_1.sanitizeResumeForExport)(await (0, parse_resume_1.parseResume)(resumeText));
            await this.prisma.parsedResume.create({
                data: { runId: run.id, data: parsedResume },
            });
            this.logger.log(`[${run.id}] Parsing job description...`);
            const parsedJd = await (0, parse_job_description_1.parseJobDescription)(jdText);
            await this.prisma.parsedJobDescription.create({
                data: { runId: run.id, data: parsedJd },
            });
            await this.prisma.resumeRun.update({
                where: { id: run.id },
                data: { status: 'parsed' },
            });
            this.logger.log(`[${run.id}] Running gap analysis...`);
            const analysis = await (0, analyze_gap_1.analyzeGap)({
                resume: parsedResume,
                jobDescription: parsedJd,
            });
            await this.prisma.analysisResult.create({
                data: { runId: run.id, data: analysis },
            });
            await this.prisma.resumeRun.update({
                where: { id: run.id },
                data: { status: 'analyzed' },
            });
            this.logger.log(`[${run.id}] Generating suggestions...`);
            const suggestions = await (0, rewrite_resume_1.rewriteResume)({
                resume: parsedResume,
                jobDescription: parsedJd,
                analysis,
            });
            this.logger.log(`[${run.id}] Validating suggestions...`);
            const codeWarnings = (0, validate_suggestions_1.validateNoDateMutation)(parsedResume, suggestions);
            if (codeWarnings.length) {
                suggestions.warnings = [
                    ...suggestions.warnings,
                    ...codeWarnings,
                ];
            }
            try {
                const aiValidation = await (0, validate_suggestions_1.validateSuggestions)({
                    originalResume: parsedResume,
                    suggestions,
                });
                if (aiValidation.warnings.length) {
                    suggestions.warnings = [
                        ...suggestions.warnings,
                        ...aiValidation.warnings.map((w) => `[${w.severity}] ${w.detail}`),
                    ];
                }
            }
            catch (validationError) {
                this.logger.warn(`[${run.id}] AI validation failed, proceeding: ${this.errorMessage(validationError)}`);
            }
            await this.prisma.suggestion.create({
                data: { runId: run.id, data: suggestions },
            });
            await this.prisma.resumeRun.update({
                where: { id: run.id },
                data: { status: 'suggested' },
            });
            return { runId: run.id, status: 'suggested' };
        }
        catch (error) {
            await this.prisma.resumeRun.update({
                where: { id: run.id },
                data: { status: 'failed' },
            });
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error(`[${run.id}] Pipeline failed: ${this.errorMessage(error)}`);
            throw new common_1.BadGatewayException('Resume analysis failed. Please try again.');
        }
        finally {
            fs.promises.unlink(filePath).catch(() => { });
        }
    }
    async getRun(runId, userId) {
        const run = await this.prisma.resumeRun.findUnique({
            where: { id: runId },
            include: {
                parsedResume: true,
                parsedJobDescription: true,
                analysisResult: true,
                suggestion: true,
                finalResume: true,
            },
        });
        if (!run || run.userId !== userId) {
            throw new common_1.NotFoundException('Run not found');
        }
        return {
            run: {
                id: run.id,
                status: run.status,
                createdAt: run.createdAt,
                updatedAt: run.updatedAt,
            },
            resume: run.parsedResume?.data,
            jobDescription: run.parsedJobDescription?.data,
            analysis: run.analysisResult?.data,
            suggestions: run.suggestion?.data,
            finalResume: run.finalResume
                ? {
                    data: run.finalResume.data,
                    pdfUrl: run.finalResume.pdfUrl,
                    docxUrl: run.finalResume.docxUrl,
                }
                : null,
        };
    }
    async applyAccepted(runId, userId, accepted) {
        const runData = await this.getRun(runId, userId);
        if (!runData.resume || !runData.suggestions) {
            throw new common_1.BadRequestException('Run is not in a state where changes can be applied');
        }
        const finalResume = (0, sanitize_resume_for_export_1.sanitizeResumeForExport)((0, merge_accepted_changes_1.mergeAcceptedChanges)(runData.resume, runData.suggestions, accepted));
        const existing = await this.prisma.finalResume.findUnique({
            where: { runId },
        });
        if (existing) {
            await this.prisma.finalResume.update({
                where: { runId },
                data: { data: finalResume },
            });
        }
        else {
            await this.prisma.finalResume.create({
                data: { runId, data: finalResume },
            });
        }
        await this.prisma.resumeRun.update({
            where: { id: runId },
            data: { status: 'reviewed' },
        });
        return { status: 'reviewed', finalResume };
    }
    async exportResume(runId, userId, format) {
        const runData = await this.getRun(runId, userId);
        if (!runData.finalResume) {
            throw new common_1.BadRequestException('No final resume found. Apply changes first.');
        }
        const resumeJson = (0, prioritize_skills_by_jd_1.prioritizeSkillsByJobKeywords)((0, sanitize_resume_for_export_1.sanitizeResumeForExport)(runData.finalResume.data), runData.jobDescription ?? undefined);
        const storageRoot = path.join(process.cwd(), 'uploads', 'resumes');
        fs.mkdirSync(storageRoot, { recursive: true });
        if (format === 'pdf') {
            const html = (0, render_resume_html_1.renderResumeHtml)(resumeJson);
            const pdfBuffer = await (0, export_pdf_1.exportPdf)(html);
            const filename = `${runId}_final.pdf`;
            const outPath = path.join(storageRoot, filename);
            fs.writeFileSync(outPath, pdfBuffer);
            const pdfUrl = `/uploads/resumes/${filename}`;
            await this.prisma.finalResume.update({
                where: { runId },
                data: { html, pdfUrl },
            });
            await this.prisma.resumeRun.update({
                where: { id: runId },
                data: { status: 'exported' },
            });
            return {
                buffer: pdfBuffer,
                contentType: 'application/pdf',
                filename: 'optimized_resume.pdf',
            };
        }
        else {
            const docxBuffer = await (0, export_docx_1.exportDocx)(resumeJson);
            const filename = `${runId}_final.docx`;
            const outPath = path.join(storageRoot, filename);
            fs.writeFileSync(outPath, docxBuffer);
            const docxUrl = `/uploads/resumes/${filename}`;
            await this.prisma.finalResume.update({
                where: { runId },
                data: { docxUrl },
            });
            await this.prisma.resumeRun.update({
                where: { id: runId },
                data: { status: 'exported' },
            });
            return {
                buffer: docxBuffer,
                contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                filename: 'optimized_resume.docx',
            };
        }
    }
};
exports.ResumeOptimizerService = ResumeOptimizerService;
exports.ResumeOptimizerService = ResumeOptimizerService = ResumeOptimizerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ResumeOptimizerService);
//# sourceMappingURL=resume-optimizer.service.js.map