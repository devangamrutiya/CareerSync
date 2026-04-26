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
var GmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GmailService = void 0;
const common_1 = require("@nestjs/common");
const googleapis_1 = require("googleapis");
const prisma_service_1 = require("../prisma/prisma.service");
const users_service_1 = require("../users/users.service");
const gemini_service_1 = require("../gemini/gemini.service");
let GmailService = GmailService_1 = class GmailService {
    usersService;
    prisma;
    gemini;
    logger = new common_1.Logger(GmailService_1.name);
    DEFAULT_PAGE_SIZE = 100;
    MAX_PAGE_SIZE = 500;
    DEFAULT_MAX_MESSAGES = Number(process.env.GMAIL_SYNC_MAX_MESSAGES || 1500);
    extractErrorMessage(error) {
        if (!error || typeof error !== 'object')
            return 'unknown error';
        const maybe = error;
        return (maybe.response?.data?.error?.message || maybe.message || 'unknown error');
    }
    constructor(usersService, prisma, gemini) {
        this.usersService = usersService;
        this.prisma = prisma;
        this.gemini = gemini;
    }
    async getConnectionStatus(userId) {
        const user = await this.usersService.findById(userId);
        return {
            connected: Boolean(user?.googleRefreshToken),
            connectedAt: user?.googleConnectedAt ?? null,
        };
    }
    oauthClientForUser(refreshToken) {
        const clientId = process.env.GOOGLE_CLIENT_ID || '';
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
        const redirectUri = process.env.GOOGLE_CALLBACK_URL ||
            'http://localhost:3001/auth/google/callback';
        const oauth2 = new googleapis_1.google.auth.OAuth2(clientId, clientSecret, redirectUri);
        oauth2.setCredentials({ refresh_token: refreshToken });
        return oauth2;
    }
    normalizeStatus(input) {
        const text = input.toLowerCase();
        if (/offer|selected|congrat/i.test(text))
            return 'Offer';
        if (/reject|decline|not\s+move|unsuccessful/i.test(text))
            return 'Rejected';
        if (/interview|assessment|assignment|shortlist|round|virtual|interaction/i.test(text)) {
            return 'Interview';
        }
        return 'Applied';
    }
    fallbackCompanyFromSender(from) {
        const cleaned = from.trim();
        const angleMatch = cleaned.match(/^(.*?)\s*<([^>]+)>$/);
        const displayName = (angleMatch?.[1] || '').replace(/["']/g, '').trim();
        if (displayName && !/no-?reply|notifications?/i.test(displayName)) {
            return displayName;
        }
        const email = (angleMatch?.[2] || cleaned).trim();
        const domain = email.split('@')[1] || '';
        if (!domain)
            return 'Unknown Company';
        const base = domain.split('.')[0] || '';
        if (!base)
            return 'Unknown Company';
        return base
            .replace(/[-_]+/g, ' ')
            .replace(/\b\w/g, (m) => m.toUpperCase())
            .trim();
    }
    fallbackRoleFromSubject(subject) {
        const cleaned = subject.trim();
        if (!cleaned)
            return 'Unknown Role';
        const roleMatch = cleaned.match(/(software engineer|developer|sde(?:[-\s]?\d+)?|full[\s-]?stack|backend|frontend|dotnet developer|qa engineer|data analyst|intern)/i);
        return roleMatch?.[1]?.trim() || 'Unknown Role';
    }
    async syncInbox(userId, args) {
        const user = await this.usersService.findById(userId);
        if (!user?.googleRefreshToken) {
            throw new common_1.BadRequestException('Connect Gmail first');
        }
        const auth = this.oauthClientForUser(user.googleRefreshToken);
        const gmail = googleapis_1.google.gmail({ version: 'v1', auth });
        const maxMessages = Math.min(Math.max(args?.maxMessages ?? this.DEFAULT_MAX_MESSAGES, 1), this.DEFAULT_MAX_MESSAGES);
        const pageSize = Math.min(Math.max(Number(process.env.GMAIL_SYNC_PAGE_SIZE || this.DEFAULT_PAGE_SIZE), 1), this.MAX_PAGE_SIZE);
        const query = args?.query?.trim() || '';
        const messages = [];
        let processedPages = 0;
        let nextPageToken;
        do {
            let list;
            try {
                list = await gmail.users.messages.list({
                    userId: 'me',
                    q: query,
                    maxResults: pageSize,
                    pageToken: nextPageToken,
                });
            }
            catch (error) {
                const message = this.extractErrorMessage(error);
                this.logger.warn(`Gmail list failed for user ${userId}: ${message}`);
                throw new common_1.BadRequestException('Gmail authorization expired or missing. Please reconnect Gmail and try again.');
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
            if (!id)
                continue;
            let full;
            try {
                full = await gmail.users.messages.get({
                    userId: 'me',
                    id,
                    format: 'metadata',
                    metadataHeaders: ['Subject', 'From', 'Date'],
                });
            }
            catch (error) {
                messageFetchFailures += 1;
                skipped += 1;
                this.logger.warn(`Skipping message ${id}: Gmail message fetch failed (${this.extractErrorMessage(error)})`);
                continue;
            }
            const snippet = full.data.snippet || '';
            const internalDateMs = full.data.internalDate
                ? Number(full.data.internalDate)
                : Date.now();
            const headers = full.data.payload?.headers || [];
            const subject = headers.find((h) => h.name?.toLowerCase() === 'subject')?.value || '';
            const from = headers.find((h) => h.name?.toLowerCase() === 'from')?.value || '';
            const emailText = `Subject: ${subject}\nFrom: ${from}\nSnippet: ${snippet}`;
            let extracted = null;
            try {
                extracted = await this.gemini.extractJobFromEmail(emailText);
            }
            catch (error) {
                aiFailures += 1;
                this.logger.warn(`Message ${id}: AI extraction failed, using fallback (${this.extractErrorMessage(error)})`);
            }
            const companyName = extracted?.companyName?.trim() || this.fallbackCompanyFromSender(from);
            const jobTitle = extracted?.jobTitle?.trim() || this.fallbackRoleFromSubject(subject);
            const status = this.normalizeStatus(extracted?.status || `${subject}\n${snippet}`);
            const usedFallback = !extracted?.companyName?.trim() || !extracted?.jobTitle?.trim();
            if (usedFallback)
                fallbackSaved += 1;
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
            }
            catch (error) {
                upsertFailures += 1;
                skipped += 1;
                this.logger.warn(`Skipping message ${id}: DB upsert failed (${this.extractErrorMessage(error)})`);
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
};
exports.GmailService = GmailService;
exports.GmailService = GmailService = GmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        prisma_service_1.PrismaService,
        gemini_service_1.GeminiService])
], GmailService);
//# sourceMappingURL=gmail.service.js.map