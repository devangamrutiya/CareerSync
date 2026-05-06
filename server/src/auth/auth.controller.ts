import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleAuthGuard } from './google-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthRateLimitGuard } from './auth-rate-limit.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(AuthRateLimitGuard)
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('register')
  @UseGuards(AuthRateLimitGuard)
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return req.user;
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    return;
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: any, @Res() res: any) {
    if (!req.user) {
      throw new UnauthorizedException('Google authentication failed');
    }

    const tokenRes = this.authService.issueToken(req.user);
    const webOrigin = process.env.WEB_ORIGIN || 'http://localhost:3000';
    const redirectUrl = `${webOrigin}/dashboard?token=${encodeURIComponent(tokenRes.access_token)}`;
    return res.redirect(redirectUrl);
  }
}
