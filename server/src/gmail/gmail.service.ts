import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { GeminiService } from '../gemini/gemini.service';

@Injectable()
export class GmailService {
  private readonly logger = new Logger(GmailService.name);
  private readonly DEFAULT_PAGE_SIZE = 100;
  private readonly MAX_PAGE_SIZE = 500;
  private readonly DEFAULT_MAX_MESSAGES = Number(
    process.env.GMAIL_SYNC_MAX_MESSAGES || 1500,
  );

  private extractErrorMessage(error: unknown): string {
    if (!error || typeof error !== 'object') return 'unknown error';
    const maybe = error as {
      message?: string;
      response?: { data?: { error?: { message?: string } } };
    };
    return (
      maybe.response?.data?.error?.message || maybe.message || 'unknown error'
    );
  }

  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private gemini: GeminiService,
  ) {}

  async getConnectionStatus(userId: string) {
    const user = await this.usersService.findById(userId);
    return {
      connected: Boolean(user?.googleRefreshToken),
      connectedAt: user?.googleConnectedAt ?? null,
    };
  }

  private oauthClientForUser(refreshToken: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri =
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:3001/auth/google/callback';
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    oauth2.setCredentials({ refresh_token: refreshToken });
    return oauth2;
  }

  private normalizeStatus(input: string): string {
    const text = input.toLowerCase();
    if (/offer|selected|congrat/i.test(text)) return 'Offer';
    if (/reject|decline|not\s+move|unsuccessful/i.test(text)) return 'Rejected';
    if (
      /interview|assessment|assignment|shortlist|round|virtual|interaction/i.test(
        text,
      )
    ) {
      return 'Interview';
    }
    return 'Applied';
  }

  private fallbackCompanyFromSender(from: string): string {
    const cleaned = from.trim();
    const angleMatch = cleaned.match(/^(.*?)\s*<([^>]+)>$/);
    const displayName = (angleMatch?.[1] || '').replace(/["']/g, '').trim();
    if (displayName && !/no-?reply|notifications?/i.test(displayName)) {
      return displayName;
    }

    const email = (angleMatch?.[2] || cleaned).trim();
    const domain = email.split('@')[1] || '';
    if (!domain) return 'Unknown Company';
    const base = domain.split('.')[0] || '';
    if (!base) return 'Unknown Company';
    return base
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (m) => m.toUpperCase())
      .trim();
  }

  private fallbackRoleFromSubject(subject: string): string {
    const cleaned = subject.trim();
    if (!cleaned) return 'Unknown Role';
    const roleMatch = cleaned.match(
      /(software engineer|developer|sde(?:[-\s]?\d+)?|full[\s-]?stack|backend|frontend|dotnet developer|qa engineer|data analyst|intern)/i,
    );
    return roleMatch?.[1]?.trim() || 'Unknown Role';
  }

  async syncInbox(
    userId: string,
    args?: { maxMessages?: number; query?: string },
  ) {
    const user = await this.usersService.findById(userId);
    if (!user?.googleRefreshToken) {
      throw new BadRequestException('Connect Gmail first');
    }

    const auth = this.oauthClientForUser(user.googleRefreshToken);
    const gmail = google.gmail({ version: 'v1', auth });

    const maxMessages = Math.min(
      Math.max(args?.maxMessages ?? this.DEFAULT_MAX_MESSAGES, 1),
      this.DEFAULT_MAX_MESSAGES,
    );
    const pageSize = Math.min(
      Math.max(
        Number(process.env.GMAIL_SYNC_PAGE_SIZE || this.DEFAULT_PAGE_SIZE),
        1,
      ),
      this.MAX_PAGE_SIZE,
    );
    const query = args?.query?.trim() || '';

    const messages: Array<{ id?: string | null }> = [];
    let processedPages = 0;
    let nextPageToken: string | undefined;
    do {
      let list;
      try {
        list = await gmail.users.messages.list({
          userId: 'me',
          q: query,
          maxResults: pageSize,
          pageToken: nextPageToken,
        });
      } catch (error) {
        const message = this.extractErrorMessage(error);
        this.logger.warn(`Gmail list failed for user ${userId}: ${message}`);
        throw new BadRequestException(
          'Gmail authorization expired or missing. Please reconnect Gmail and try again.',
        );
      }

      processedPages += 1;
      const chunk = list.data.messages || [];
      const remaining = maxMessages - messages.length;
      messages.push(...chunk.slice(0, remaining));
      nextPageToken = list.data.nextPageToken || undefined;
    } while (nextPageToken && messages.length < maxMessages);

    let upserted = 0;
    let skipped = 0;
    let aiFailures = 0;
    let upsertFailures = 0;
    let messageFetchFailures = 0;
    let fallbackSaved = 0;

    for (const m of messages) {
      const id = m.id;
      if (!id) continue;

      let full;
      try {
        full = await gmail.users.messages.get({
          userId: 'me',
          id,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'Date'],
        });
      } catch (error) {
        messageFetchFailures += 1;
        skipped += 1;
        this.logger.warn(
          `Skipping message ${id}: Gmail message fetch failed (${this.extractErrorMessage(error)})`,
        );
        continue;
      }

      const snippet = full.data.snippet || '';
      const internalDateMs = full.data.internalDate
        ? Number(full.data.internalDate)
        : Date.now();
      const headers = full.data.payload?.headers || [];
      const subject =
        headers.find((h) => h.name?.toLowerCase() === 'subject')?.value || '';
      const from =
        headers.find((h) => h.name?.toLowerCase() === 'from')?.value || '';

      const emailText = `Subject: ${subject}\nFrom: ${from}\nSnippet: ${snippet}`;
      let extracted: {
        companyName: string;
        jobTitle: string;
        status: string;
      } | null = null;
      try {
        extracted = await this.gemini.extractJobFromEmail(emailText);
      } catch (error) {
        aiFailures += 1;
        this.logger.warn(
          `Message ${id}: AI extraction failed, using fallback (${this.extractErrorMessage(error)})`,
        );
      }

      const companyName =
        extracted?.companyName?.trim() || this.fallbackCompanyFromSender(from);
      const jobTitle =
        extracted?.jobTitle?.trim() || this.fallbackRoleFromSubject(subject);
      const status = this.normalizeStatus(
        extracted?.status || `${subject}\n${snippet}`,
      );
      const usedFallback =
        !extracted?.companyName?.trim() || !extracted?.jobTitle?.trim();
      if (usedFallback) fallbackSaved += 1;

      try {
        await this.prisma.job.upsert({
          where: {
            userId_sourceEmailId: {
              userId,
              sourceEmailId: id,
            },
          },
          update: {
            companyName,
            jobTitle,
            status,
            appliedDate: new Date(internalDateMs),
          },
          create: {
            companyName,
            jobTitle,
            status,
            appliedDate: new Date(internalDateMs),
            sourceEmailId: id,
            userId,
          },
        });
      } catch (error) {
        upsertFailures += 1;
        skipped += 1;
        this.logger.warn(
          `Skipping message ${id}: DB upsert failed (${this.extractErrorMessage(error)})`,
        );
        continue;
      }

      upserted += 1;
    }

    return {
      scanned: messages.length,
      upserted,
      skipped,
      aiFailures,
      upsertFailures,
      messageFetchFailures,
      fallbackSaved,
      processedPages,
      hasMore: Boolean(nextPageToken),
    };
  }
}
