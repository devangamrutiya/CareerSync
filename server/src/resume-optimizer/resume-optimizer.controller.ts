import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResumeOptimizerService } from './resume-optimizer.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import type { Request, Response } from 'express';
import type { AcceptedChanges } from './types/resume.types';

const storage = diskStorage({
  destination: (_req, _file, cb) => {
    const dest = path.join(process.cwd(), 'uploads', 'resumes');
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${crypto.randomUUID()}${ext}`;
    cb(null, name);
  },
});

const allowedExtensions = ['.pdf', '.docx'];
const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

@UseGuards(JwtAuthGuard)
@Controller('resume-optimizer')
export class ResumeOptimizerController {
  constructor(private service: ResumeOptimizerService) {}

  /**
   * POST /resume-optimizer/analyze
   * Upload resume + JD text, run full pipeline
   */
  @Post('analyze')
  @UseInterceptors(
    FileInterceptor('resume', {
      storage,
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const mime = (file.mimetype || '').toLowerCase();

        if (!allowedExtensions.includes(ext)) {
          return cb(
            new BadRequestException('Only PDF/DOCX resumes are supported'),
            false,
          );
        }
        if (!allowedMimeTypes.includes(mime)) {
          return cb(
            new BadRequestException('Unsupported file MIME type'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async analyze(
    @Req() req: Request & { user: { id: string } },
    @UploadedFile() file: Express.Multer.File,
    @Body('jdText') jdText: string,
  ) {
    if (!file) throw new BadRequestException('Resume file is required');
    const cleanedJd = (jdText || '').trim();
    if (!cleanedJd)
      throw new BadRequestException('Job description text is required');
    if (cleanedJd.length > 15_000)
      throw new BadRequestException(
        'Job description must be 15,000 characters or fewer',
      );

    return this.service.analyze({
      userId: req.user.id,
      uploadedFile: file,
      jdText: cleanedJd,
    });
  }

  /**
   * GET /resume-optimizer/runs/:runId
   * Get full run data for review screen
   */
  @Get('runs/:runId')
  async getRun(
    @Req() req: Request & { user: { id: string } },
    @Param('runId') runId: string,
  ) {
    return this.service.getRun(runId, req.user.id);
  }

  /**
   * POST /resume-optimizer/runs/:runId/apply
   * Apply accepted changes
   */
  @Post('runs/:runId/apply')
  async applyChanges(
    @Req() req: Request & { user: { id: string } },
    @Param('runId') runId: string,
    @Body('accepted') accepted: AcceptedChanges,
  ) {
    if (!accepted)
      throw new BadRequestException('accepted payload is required');
    return this.service.applyAccepted(runId, req.user.id, accepted);
  }

  /**
   * POST /resume-optimizer/runs/:runId/export
   * Export final resume as PDF or DOCX
   */
  @Post('runs/:runId/export')
  async exportResume(
    @Req() req: Request & { user: { id: string } },
    @Param('runId') runId: string,
    @Body('format') format: string,
    @Res() res: Response,
  ) {
    const fmt = format === 'docx' ? 'docx' : 'pdf';
    const result = await this.service.exportResume(runId, req.user.id, fmt);

    res.setHeader('Content-Type', result.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    res.send(result.buffer);
  }
}
