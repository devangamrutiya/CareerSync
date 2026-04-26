import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { GeminiService } from '../gemini/gemini.service';
export declare class GmailService {
    private usersService;
    private prisma;
    private gemini;
    private readonly logger;
    private readonly DEFAULT_PAGE_SIZE;
    private readonly MAX_PAGE_SIZE;
    private readonly DEFAULT_MAX_MESSAGES;
    private extractErrorMessage;
    constructor(usersService: UsersService, prisma: PrismaService, gemini: GeminiService);
    getConnectionStatus(userId: string): Promise<{
        connected: boolean;
        connectedAt: Date | null;
    }>;
    private oauthClientForUser;
    private normalizeStatus;
    private fallbackCompanyFromSender;
    private fallbackRoleFromSubject;
    syncInbox(userId: string, args?: {
        maxMessages?: number;
        query?: string;
    }): Promise<{
        scanned: number;
        upserted: number;
        skipped: number;
        aiFailures: number;
        upsertFailures: number;
        messageFetchFailures: number;
        fallbackSaved: number;
        processedPages: number;
        hasMore: boolean;
    }>;
}
