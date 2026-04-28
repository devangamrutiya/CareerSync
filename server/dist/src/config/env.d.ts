export declare function isProduction(): boolean;
export declare function getJwtSecret(): string;
export declare function getCorsOrigins(): string[];
export declare function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean;
export declare function isGoogleOAuthConfigured(): boolean;
export declare function shouldTrustProxy(): boolean;
