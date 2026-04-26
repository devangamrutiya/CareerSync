import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type AuthUser = {
  id: string;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private buildAuthResponse(user: AuthUser) {
    const payload = { email: user.email, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email },
    };
  }

  issueToken(user: AuthUser) {
    return this.buildAuthResponse({
      id: user.id,
      email: user.email.trim().toLowerCase(),
    });
  }

  async register(data: RegisterDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.usersService.create({
      email: data.email.trim().toLowerCase(),
      password: hashedPassword,
    });

    return this.issueToken(user);
  }

  async login(credentials: LoginDto) {
    const user = await this.usersService.findByEmail(
      credentials.email.trim().toLowerCase(),
    );
    if (
      !user ||
      typeof user.password !== 'string' ||
      user.password.length === 0
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(credentials.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueToken(user);
  }
}
