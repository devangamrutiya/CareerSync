import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        password: string | null;
        provider: string;
        createdAt: Date;
        googleRefreshToken: string | null;
        googleConnectedAt: Date | null;
    } | null>;
    findById(id: string): Promise<{
        id: string;
        email: string;
        password: string | null;
        provider: string;
        createdAt: Date;
        googleRefreshToken: string | null;
        googleConnectedAt: Date | null;
    } | null>;
    create(data: Prisma.UserCreateInput): Promise<{
        id: string;
        email: string;
        password: string | null;
        provider: string;
        createdAt: Date;
        googleRefreshToken: string | null;
        googleConnectedAt: Date | null;
    }>;
    updateById(id: string, data: Prisma.UserUpdateInput): Promise<{
        id: string;
        email: string;
        password: string | null;
        provider: string;
        createdAt: Date;
        googleRefreshToken: string | null;
        googleConnectedAt: Date | null;
    }>;
}
