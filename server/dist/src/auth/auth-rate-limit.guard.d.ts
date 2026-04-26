import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class AuthRateLimitGuard implements CanActivate {
    private static readonly attempts;
    private getClientIp;
    private limitsForPath;
    canActivate(context: ExecutionContext): boolean;
}
