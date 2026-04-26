import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('maps duplicate email errors to ConflictException', async () => {
    const prismaError = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as Prisma.PrismaClientKnownRequestError;
    Object.defineProperty(prismaError, 'code', {
      value: 'P2002',
      configurable: true,
    });
    prismaService.user.create.mockRejectedValue(prismaError);

    await expect(
      service.create({
        email: 'user@example.com',
        password: 'hashed-password',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
