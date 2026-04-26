import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findByEmail: jest.Mock;
    create: jest.Mock;
  };
  let jwtService: {
    sign: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('registers a user and returns an auth response', async () => {
    usersService.create.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
    });

    const result = await service.register({
      email: 'User@Example.com',
      password: 'password123',
    });

    expect(usersService.create).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: expect.any(String),
    });
    expect(result).toEqual({
      access_token: 'signed-token',
      user: { id: 'user-1', email: 'user@example.com' },
    });
    expect(jwtService.sign).toHaveBeenCalledWith({
      email: 'user@example.com',
      sub: 'user-1',
    });
  });

  it('logs in a user with valid credentials', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      password: passwordHash,
    });

    const result = await service.login({
      email: 'User@Example.com',
      password: 'password123',
    });

    expect(usersService.findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(result).toEqual({
      access_token: 'signed-token',
      user: { id: 'user-1', email: 'user@example.com' },
    });
  });

  it('rejects invalid credentials', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('issues a token for an existing auth user', () => {
    const result = service.issueToken({
      id: 'user-1',
      email: 'User@Example.com',
    });

    expect(result).toEqual({
      access_token: 'signed-token',
      user: { id: 'user-1', email: 'user@example.com' },
    });
  });
});
