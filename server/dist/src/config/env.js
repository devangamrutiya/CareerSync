"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProduction = isProduction;
exports.getJwtSecret = getJwtSecret;
exports.getCorsOrigins = getCorsOrigins;
exports.isOriginAllowed = isOriginAllowed;
exports.isGoogleOAuthConfigured = isGoogleOAuthConfigured;
exports.shouldTrustProxy = shouldTrustProxy;
const DEFAULT_LOCAL_ORIGIN = 'http://localhost:3000';
function isProduction() {
    return process.env.NODE_ENV === 'production';
}
function getJwtSecret() {
    const secret = process.env.JWT_SECRET?.trim();
    if (secret)
        return secret;
    if (isProduction()) {
        throw new Error('JWT_SECRET is required in production');
    }
    return 'supersecret123';
}
function getCorsOrigins() {
    const explicit = process.env.CORS_ORIGINS?.trim();
    if (explicit) {
        return explicit
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean);
    }
    const webOrigin = process.env.WEB_ORIGIN?.trim();
    const nextPublicWebOrigin = process.env.NEXT_PUBLIC_WEB_ORIGIN?.trim();
    const origins = [webOrigin, nextPublicWebOrigin].filter(Boolean);
    return origins.length > 0 ? origins : [DEFAULT_LOCAL_ORIGIN];
}
function isOriginAllowed(origin, allowedOrigins) {
    if (!origin)
        return false;
    return allowedOrigins.some((allowedOrigin) => {
        if (allowedOrigin === origin) {
            return true;
        }
        if (allowedOrigin.includes('*')) {
            const escaped = allowedOrigin.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`^${escaped.replace(/\\\*/g, '.*')}$`);
            return regex.test(origin);
        }
        return false;
    });
}
function isGoogleOAuthConfigured() {
    return (Boolean(process.env.GOOGLE_CLIENT_ID?.trim()) &&
        Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim()));
}
function shouldTrustProxy() {
    const raw = process.env.TRUST_PROXY?.trim().toLowerCase();
    return raw === '1' || raw === 'true' || raw === 'yes';
}
//# sourceMappingURL=env.js.map