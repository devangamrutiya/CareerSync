import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    login: jest.Mock;
    register: jest.Mock;
    issueToken: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      register: jest.fn(),
      issueToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('forwards login payloads to auth service', async () => {
    authService.login.mockResolvedValue({ access_token: 'token' });

    await controller.login({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(authService.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });

  it('forwards register payloads to auth service', async () => {
    authService.register.mockResolvedValue({ access_token: 'token' });

    await controller.register({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(authService.register).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });

  it('redirects Google callback to the dashboard with a token', async () => {
    authService.issueToken.mockReturnValue({ access_token: 'token-123' });
    const res = { redirect: jest.fn() };
    const oldWebOrigin = process.env.WEB_ORIGIN;
    process.env.WEB_ORIGIN = 'http://localhost:3000';

    await controller.googleAuthCallback(
      { user: { id: 'user-1', email: 'user@example.com' } },
      res,
    );

    expect(authService.issueToken).toHaveBeenCalledWith({
      id: 'user-1',
      email: 'user@example.com',
    });
    expect(res.redirect).toHaveBeenCalledWith(
      'http://localhost:3000/dashboard?token=token-123',
    );
    process.env.WEB_ORIGIN = oldWebOrigin;
  });
});
