import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';

type AttemptLog = {
  timestamps: number[];
};

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  private static readonly attempts = new Map<string, AttemptLog>();

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    const ipFromForwarded = Array.isArray(forwarded)
      ? forwarded[0]
      : typeof forwarded === 'string'
        ? forwarded.split(',')[0]?.trim()
        : null;

    return ipFromForwarded || req.ip || 'unknown';
  }

  private limitsForPath(path: string): { limit: number; windowMs: number } {
    if (path.endsWith('/register')) {
      return { limit: 8, windowMs: 60_000 };
    }

    return { limit: 12, windowMs: 60_000 };
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const ip = this.getClientIp(req);
    const path = req.originalUrl || req.url || '/auth';
    const { limit, windowMs } = this.limitsForPath(path);
    const key = `${ip}:${path}`;

    const now = Date.now();
    const log = AuthRateLimitGuard.attempts.get(key) ?? { timestamps: [] };
    log.timestamps = log.timestamps.filter((ts) => now - ts < windowMs);

    if (log.timestamps.length >= limit) {
      throw new BadRequestException(
        'Too many authentication attempts. Please wait a minute and try again.',
      );
    }

    log.timestamps.push(now);
    AuthRateLimitGuard.attempts.set(key, log);

    return true;
  }
}
