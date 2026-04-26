import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { isGoogleOAuthConfigured, isProduction } from '../config/env';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private usersService: UsersService) {
    const clientID = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

    if (isProduction() && !isGoogleOAuthConfigured()) {
      throw new Error(
        'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required in production',
      );
    }

    super({
      clientID: clientID || 'placeholder_client_id',
      clientSecret: clientSecret || 'placeholder_client_secret',
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:3001/auth/google/callback',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { emails } = profile;
    const email = emails[0].value.trim().toLowerCase();
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      user = await this.usersService.create({
        email,
        provider: 'google',
        password: null,
      });
    }

    if (refreshToken) {
      user = await this.usersService.updateById(user.id, {
        googleRefreshToken: refreshToken,
        googleConnectedAt: new Date(),
        provider: 'google',
      });
    }

    done(null, user);
  }
}
