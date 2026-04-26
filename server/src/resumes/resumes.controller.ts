import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResumesService } from './resumes.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import type { Request, Response } from 'express';

const storage = diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(process.cwd(), 'uploads', 'resumes');
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
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
@Controller('resumes')
export class ResumesController {
  constructor(private resumesService: ResumesService) {}

  @Post('optimize')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB MVP limit
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
  async optimize(
    @Req() req: Request & { user: { id: string } },
    @UploadedFile() file: Express.Multer.File,
    @Body('jobDescription') jobDescription: string,
    @Res() res: Response,
  ): Promise<void> {
    if (!file) throw new BadRequestException('Resume file is required');
    const cleanedJobDescription = (jobDescription || '').trim();
    if (!cleanedJobDescription)
      throw new BadRequestException('jobDescription is required');
    if (cleanedJobDescription.length > 10_000) {
      throw new BadRequestException(
        'jobDescription must be 10,000 characters or fewer',
      );
    }

    const buffer = await this.resumesService.optimizeResume({
      userId: req.user.id,
      uploadedFile: file,
      jobDescription: cleanedJobDescription,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="optimized_resume.pdf"`,
    );
    res.send(buffer);
  }
}
