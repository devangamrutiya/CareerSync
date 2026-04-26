export declare class GeminiService {
    private readonly logger;
    private ai;
    private readonly geminiModel;
    private readonly groqModel;
    private readonly minIntervalMs;
    private readonly lastCallAt;
    private geminiDisabledDueHardQuota;
    private readonly MAX_RETRIES;
    private readonly BASE_DELAY_MS;
    constructor();
    private errorMessage;
    private isRetryable;
    private isHardQuotaExceeded;
    private shouldDisableGeminiAfterError;
    private disableGeminiIfHardQuota;
    private providerOrder;
    private isProviderEnabled;
    private waitForProviderSlot;
    private generateViaGroq;
    private generateViaGemini;
    private generateContent;
    private withRetry;
    private retryDelayMs;
    extractJobFromEmail(emailText: string): Promise<{
        companyName: string;
        jobTitle: string;
        status: string;
    } | null>;
    optimizeResumeForJob(input: {
        resumeText: string;
        jobDescription: string;
    }): Promise<{
        optimizedText: string;
    }>;
}
