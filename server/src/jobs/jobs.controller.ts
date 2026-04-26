import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobsService } from './jobs.service';

@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get()
  list(@Req() req: any) {
    return this.jobsService.listForUser(req.user.id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateJobDto) {
    return this.jobsService.createForUser(req.user.id, dto);
  }

  @Get(':id')
  get(@Req() req: any, @Param('id') id: string) {
    return this.jobsService.getForUser(req.user.id, id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.jobsService.updateForUser(req.user.id, id, dto);
  }

  @Delete(':id')
  delete(@Req() req: any, @Param('id') id: string) {
    return this.jobsService.deleteForUser(req.user.id, id);
  }
}
