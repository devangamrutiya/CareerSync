"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AuthRateLimitGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRateLimitGuard = void 0;
const common_1 = require("@nestjs/common");
let AuthRateLimitGuard = class AuthRateLimitGuard {
    static { AuthRateLimitGuard_1 = this; }
    static attempts = new Map();
    getClientIp(req) {
        const forwarded = req.headers['x-forwarded-for'];
        const ipFromForwarded = Array.isArray(forwarded)
            ? forwarded[0]
            : typeof forwarded === 'string'
                ? forwarded.split(',')[0]?.trim()
                : null;
        return ipFromForwarded || req.ip || 'unknown';
    }
    limitsForPath(path) {
        if (path.endsWith('/register')) {
            return { limit: 8, windowMs: 60_000 };
        }
        return { limit: 12, windowMs: 60_000 };
    }
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const ip = this.getClientIp(req);
        const path = req.originalUrl || req.url || '/auth';
        const { limit, windowMs } = this.limitsForPath(path);
        const key = `${ip}:${path}`;
        const now = Date.now();
        const log = AuthRateLimitGuard_1.attempts.get(key) ?? { timestamps: [] };
        log.timestamps = log.timestamps.filter((ts) => now - ts < windowMs);
        if (log.timestamps.length >= limit) {
            throw new common_1.BadRequestException('Too many authentication attempts. Please wait a minute and try again.');
        }
        log.timestamps.push(now);
        AuthRateLimitGuard_1.attempts.set(key, log);
        return true;
    }
};
exports.AuthRateLimitGuard = AuthRateLimitGuard;
exports.AuthRateLimitGuard = AuthRateLimitGuard = AuthRateLimitGuard_1 = __decorate([
    (0, common_1.Injectable)()
], AuthRateLimitGuard);
//# sourceMappingURL=auth-rate-limit.guard.js.map