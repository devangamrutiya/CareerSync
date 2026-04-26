import {
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { isGoogleOAuthConfigured } from '../config/env';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  override canActivate(context: ExecutionContext) {
    if (!isGoogleOAuthConfigured()) {
      throw new ServiceUnavailableException('Google OAuth is not configured');
    }

    return super.canActivate(context);
  }

  public override getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const mode = typeof req.query.mode === 'string' ? req.query.mode : 'login';

    if (mode.toLowerCase() === 'gmail') {
      return {
        scope: [
          'email',
          'profile',
          'https://www.googleapis.com/auth/gmail.readonly',
        ],
        accessType: 'offline',
        prompt: 'consent',
        includeGrantedScopes: true,
      };
    }

    return {
      scope: ['email', 'profile'],
    };
  }
}
