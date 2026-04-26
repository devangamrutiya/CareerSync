import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import * as pdfParseModule from 'pdf-parse';
import mammoth from 'mammoth';

import type {
  ResumeJson,
  JobDescriptionJson,
  GapAnalysisJson,
  ResumeSuggestionsJson,
  AcceptedChanges,
} from './types/resume.types';

import { parseResume } from './gemini/parse-resume';
import { parseJobDescription } from './gemini/parse-job-description';
import { analyzeGap } from './gemini/analyze-gap';
import { rewriteResume } from './gemini/rewrite-resume';
import {
  validateSuggestions,
  validateNoDateMutation,
} from './gemini/validate-suggestions';
import { mergeAcceptedChanges } from './logic/merge-accepted-changes';
import { renderResumeHtml } from './render/render-resume-html';
import { exportPdf } from './render/export-pdf';
import { exportDocx } from './render/export-docx';

// ─── PDF text extraction (reused from old service) ────────

function readFileAsBuffer(filePath: string): Buffer {
  return fs.readFileSync(filePath);
}

async function extractTextFromPdf(filePath: string): Promise<string> {
  const pdfBuffer = readFileAsBuffer(filePath);
  try {
    const pdfParseFn = (pdfParseModule as unknown as { default?: unknown })
      .default;
    const fn = (pdfParseFn ?? pdfParseModule) as unknown as (
      buf: Buffer,
    ) => Promise<{ text: string }>;
    const data = await fn(pdfBuffer);
    return data.text ?? '';
  } catch {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(pdfBuffer) });
    const document = await loadingTask.promise;
    const pagesText: string[] = [];
    for (let i = 1; i <= document.numPages; i++) {
      const page = await document.getPage(i);
      const textContent = await page.getTextContent();
      const line = textContent.items
        .map((item) => (item as { str?: string }).str ?? '')
        .join(' ');
      pagesText.push(line);
    }
    return pagesText.join('\n');
  }
}

async function extractTextFromFile(
  filePath: string,
  originalname: string,
): Promise<string> {
  const ext = path.extname(originalname).toLowerCase();

  if (ext === '.pdf') {
    return extractTextFromPdf(filePath);
  }

  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  throw new BadRequestException('Only PDF/DOCX resumes are supported');
}

// ─── Service ──────────────────────────────────────────────

@Injectable()
export class ResumeOptimizerService {
  private readonly logger = new Logger(ResumeOptimizerService.name);

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'unknown error';
  }

  constructor(private prisma: PrismaService) {}

  /**
   * Full pipeline: upload → parse → analyze → suggest → validate
   */
  async analyze(input: {
    userId: string;
    uploadedFile: Express.Multer.File;
    jdText: string;
  }): Promise<{ runId: string; status: string }> {
    const { userId, uploadedFile, jdText } = input;
    const filePath = uploadedFile.path;

    const storageRoot = path.join(process.cwd(), 'uploads', 'resumes');
    const originalUrl = path
      .join('/uploads', 'resumes', uploadedFile.filename)
      .replaceAll('\\', '/');

    // Create run record
    const run = await this.prisma.resumeRun.create({
      data: {
        userId,
        originalResumeFileUrl: originalUrl,
        originalJdText: jdText,
        status: 'uploaded',
      },
    });

    try {
      // Step 1: Extract text from resume
      const resumeText = await extractTextFromFile(
        filePath,
        uploadedFile.originalname,
      );
      if (!resumeText.trim()) {
        throw new BadRequestException('Could not extract text from resume');
      }

      // Step 2: Parse resume → ResumeJson
      this.logger.log(`[${run.id}] Parsing resume...`);
      const parsedResume = await parseResume(resumeText);
      await this.prisma.parsedResume.create({
        data: { runId: run.id, data: parsedResume as any },
      });

      // Step 3: Parse JD → JobDescriptionJson
      this.logger.log(`[${run.id}] Parsing job description...`);
      const parsedJd = await parseJobDescription(jdText);
      await this.prisma.parsedJobDescription.create({
        data: { runId: run.id, data: parsedJd as any },
      });

      await this.prisma.resumeRun.update({
        where: { id: run.id },
        data: { status: 'parsed' },
      });

      // Step 4: Gap analysis
      this.logger.log(`[${run.id}] Running gap analysis...`);
      const analysis = await analyzeGap({
        resume: parsedResume,
        jobDescription: parsedJd,
      });
      await this.prisma.analysisResult.create({
        data: { runId: run.id, data: analysis as any },
      });

      await this.prisma.resumeRun.update({
        where: { id: run.id },
        data: { status: 'analyzed' },
      });

      // Step 5: Generate suggestions
      this.logger.log(`[${run.id}] Generating suggestions...`);
      const suggestions = await rewriteResume({
        resume: parsedResume,
        jobDescription: parsedJd,
        analysis,
      });

      // Step 6: Validate suggestions
      this.logger.log(`[${run.id}] Validating suggestions...`);
      const codeWarnings = validateNoDateMutation(parsedResume, suggestions);
      if (codeWarnings.length) {
        suggestions.warnings = [
          ...suggestions.warnings,
          ...codeWarnings,
        ];
      }

      try {
        const aiValidation = await validateSuggestions({
          originalResume: parsedResume,
          suggestions,
        });
        if (aiValidation.warnings.length) {
          suggestions.warnings = [
            ...suggestions.warnings,
            ...aiValidation.warnings.map((w) => `[${w.severity}] ${w.detail}`),
          ];
        }
      } catch (validationError) {
        this.logger.warn(
          `[${run.id}] AI validation failed, proceeding: ${this.errorMessage(validationError)}`,
        );
      }

      await this.prisma.suggestion.create({
        data: { runId: run.id, data: suggestions as any },
      });

      await this.prisma.resumeRun.update({
        where: { id: run.id },
        data: { status: 'suggested' },
      });

      return { runId: run.id, status: 'suggested' };
    } catch (error) {
      await this.prisma.resumeRun.update({
        where: { id: run.id },
        data: { status: 'failed' },
      });

      if (error instanceof HttpException) throw error;

      this.logger.error(
        `[${run.id}] Pipeline failed: ${this.errorMessage(error)}`,
      );
      throw new BadGatewayException(
        'Resume analysis failed. Please try again.',
      );
    } finally {
      fs.promises.unlink(filePath).catch(() => {});
    }
  }

  /**
   * Get full run data for review screen
   */
  async getRun(runId: string, userId: string) {
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
      throw new NotFoundException('Run not found');
    }

    return {
      run: {
        id: run.id,
        status: run.status,
        createdAt: run.createdAt,
        updatedAt: run.updatedAt,
      },
      resume: run.parsedResume?.data as ResumeJson | null,
      jobDescription: run.parsedJobDescription?.data as JobDescriptionJson | null,
      analysis: run.analysisResult?.data as GapAnalysisJson | null,
      suggestions: run.suggestion?.data as ResumeSuggestionsJson | null,
      finalResume: run.finalResume
        ? {
            data: run.finalResume.data as ResumeJson,
            pdfUrl: run.finalResume.pdfUrl,
            docxUrl: run.finalResume.docxUrl,
          }
        : null,
    };
  }

  /**
   * Apply accepted changes and save final resume
   */
  async applyAccepted(
    runId: string,
    userId: string,
    accepted: AcceptedChanges,
  ) {
    const runData = await this.getRun(runId, userId);

    if (!runData.resume || !runData.suggestions) {
      throw new BadRequestException(
        'Run is not in a state where changes can be applied',
      );
    }

    const finalResume = mergeAcceptedChanges(
      runData.resume,
      runData.suggestions,
      accepted,
    );

    // Upsert final resume
    const existing = await this.prisma.finalResume.findUnique({
      where: { runId },
    });

    if (existing) {
      await this.prisma.finalResume.update({
        where: { runId },
        data: { data: finalResume as any },
      });
    } else {
      await this.prisma.finalResume.create({
        data: { runId, data: finalResume as any },
      });
    }

    await this.prisma.resumeRun.update({
      where: { id: runId },
      data: { status: 'reviewed' },
    });

    return { status: 'reviewed', finalResume };
  }

  /**
   * Export the final resume as PDF or DOCX
   */
  async exportResume(
    runId: string,
    userId: string,
    format: 'pdf' | 'docx',
  ): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
    const runData = await this.getRun(runId, userId);

    if (!runData.finalResume) {
      throw new BadRequestException(
        'No final resume found. Apply changes first.',
      );
    }

    const resumeJson = runData.finalResume.data;
    const storageRoot = path.join(process.cwd(), 'uploads', 'resumes');
    fs.mkdirSync(storageRoot, { recursive: true });

    if (format === 'pdf') {
      const html = renderResumeHtml(resumeJson);
      const pdfBuffer = await exportPdf(html);

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
    } else {
      const docxBuffer = await exportDocx(resumeJson);

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
        contentType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        filename: 'optimized_resume.docx',
      };
    }
  }
}
