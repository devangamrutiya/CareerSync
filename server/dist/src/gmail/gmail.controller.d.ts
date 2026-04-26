import { GmailService } from './gmail.service';
export declare class GmailController {
    private gmailService;
    constructor(gmailService: GmailService);
    status(req: any): Promise<{
        connected: boolean;
        connectedAt: Date | null;
    }>;
    sync(req: any, body: any): Promise<{
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
