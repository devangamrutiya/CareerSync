import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GmailService } from './gmail.service';

@UseGuards(JwtAuthGuard)
@Controller('gmail')
export class GmailController {
  constructor(private gmailService: GmailService) {}

  @Get('status')
  status(@Req() req: any) {
    return this.gmailService.getConnectionStatus(req.user.id);
  }

  @Post('sync')
  sync(@Req() req: any, @Body() body: any) {
    return this.gmailService.syncInbox(req.user.id, {
      maxMessages: body?.maxMessages,
      query: body?.query,
    });
  }
}
