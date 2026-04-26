import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../gemini/gemini.service';
import * as fs from 'fs';
import * as path from 'path';
import * as pdfParseModule from 'pdf-parse';
import mammoth from 'mammoth';
import puppeteer from 'puppeteer';

export type OptimizedResumeInput = {
  userId: string;
  uploadedFile: Express.Multer.File;
  jobDescription: string;
};

function readFileAsBuffer(filePath: string): Buffer {
  return fs.readFileSync(filePath);
}

function sanitizeText(s: string) {
  return s.replace(/\r\n/g, '\n').replace(/\t/g, ' ').trim();
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
    // Fallback parser for PDFs that pdf-parse cannot decode.
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(pdfBuffer),
    });
    const document = await loadingTask.promise;
    const pagesText: string[] = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const line = textContent.items
        .map((item) => {
          const maybe = item as { str?: string };
          return maybe.str ?? '';
        })
        .join(' ');
      pagesText.push(line);
    }

    return pagesText.join('\n');
  }
}

function markdownToHtml(text: string): string {
  const lines = text.split(/\r?\n/);
  const htmlParts: string[] = [];
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const bold = (s: string) =>
    esc(s).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      htmlParts.push('<br/>');
    } else if (line.match(/^###\s+/)) {
      htmlParts.push(`<h3>${bold(line.replace(/^###\s+/, ''))}</h3>`);
    } else if (line.match(/^##\s+/)) {
      htmlParts.push(`<h2>${bold(line.replace(/^##\s+/, ''))}</h2>`);
    } else if (line.match(/^#\s+/)) {
      htmlParts.push(`<h1>${bold(line.replace(/^#\s+/, ''))}</h1>`);
    } else if (line.match(/^[\*\-]\s+/)) {
      htmlParts.push(`<li>${bold(line.replace(/^[\*\-]\s+/, ''))}</li>`);
    } else {
      htmlParts.push(`<p>${bold(line)}</p>`);
    }
  }

  // Wrap consecutive <li> items in <ul>
  let html = htmlParts.join('\n');
  html = html.replace(/(<li>.*?<\/li>\n?)+/gs, (match) => `<ul>${match}</ul>`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 11pt;
    line-height: 1.55;
    color: #1a1a1a;
    padding: 40px 50px;
    max-width: 800px;
    margin: 0 auto;
  }
  h1 { font-size: 20pt; font-weight: 700; margin-top: 16px; margin-bottom: 6px; color: #111; }
  h2 {
    font-size: 13pt; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.5px; color: #111; border-bottom: 1.5px solid #333;
    padding-bottom: 3px; margin-top: 18px; margin-bottom: 8px;
  }
  h3 { font-size: 11.5pt; font-weight: 600; margin-top: 12px; margin-bottom: 4px; }
  p { margin-bottom: 4px; }
  ul { padding-left: 20px; margin-top: 4px; margin-bottom: 8px; }
  li { margin-bottom: 3px; }
  strong { font-weight: 700; }
  br { display: block; margin-bottom: 4px; content: ""; }
</style>
</head>
<body>
${html}
</body>
</html>`;
}

async function renderMarkdownToPdfBytes(text: string): Promise<Buffer> {
  const html = markdownToHtml(text);
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

@Injectable()
export class ResumesService {
  private readonly logger = new Logger(ResumesService.name);

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'unknown error';
  }

  constructor(
    private prisma: PrismaService,
    private gemini: GeminiService,
  ) {}

  async optimizeResume(input: OptimizedResumeInput): Promise<Buffer> {
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
        } catch (error) {
          this.logger.warn(
            `PDF parsing failed for user ${userId}: ${this.errorMessage(error)}`,
          );
          throw new BadRequestException(
            'Unable to read the uploaded PDF resume',
          );
        }
      } else if (ext === '.docx') {
        // DOC/DOCX: use mammoth for docx; .doc may not work
        try {
          const result = await mammoth.extractRawText({ path: filePath });
          resumeText = result.value;
        } catch (error) {
          this.logger.warn(
            `DOCX parsing failed for user ${userId}: ${this.errorMessage(error)}`,
          );
          throw new BadRequestException(
            'Unable to read the uploaded DOCX resume',
          );
        }
      } else {
        throw new BadRequestException('Only PDF/DOCX resumes are supported');
      }

      resumeText = sanitizeText(resumeText);
      if (!resumeText) {
        throw new BadRequestException('Could not extract text from resume');
      }

      const optimized = await this.gemini.optimizeResumeForJob({
        resumeText,
        jobDescription,
      });
      const optimizedText = sanitizeText(optimized?.optimizedText || '');
      if (!optimizedText) {
        throw new BadGatewayException(
          'Resume optimization service returned empty content.',
        );
      }

      const pdfBytes = await renderMarkdownToPdfBytes(optimizedText);

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
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Resume optimize failed for user ${userId}: ${this.errorMessage(error)}`,
      );
      throw new InternalServerErrorException(
        'Unable to optimize resume at this time.',
      );
    } finally {
      fs.promises.unlink(filePath).catch(() => {
        // File cleanup best-effort to prevent temporary upload accumulation.
      });
    }
  }
}
