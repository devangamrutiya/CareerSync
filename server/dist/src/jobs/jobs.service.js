"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let JobsService = class JobsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listForUser(userId) {
        return this.prisma.job.findMany({
            where: { userId },
            orderBy: { appliedDate: 'desc' },
        });
    }
    async createForUser(userId, dto) {
        return this.prisma.job.create({
            data: {
                companyName: dto.companyName,
                jobTitle: dto.jobTitle,
                status: dto.status ?? 'Applied',
                appliedDate: dto.appliedDate ? new Date(dto.appliedDate) : undefined,
                userId,
            },
        });
    }
    async getForUser(userId, jobId) {
        const job = await this.prisma.job.findFirst({
            where: { id: jobId, userId },
        });
        if (!job)
            throw new common_1.NotFoundException('Job not found');
        return job;
    }
    async updateForUser(userId, jobId, dto) {
        await this.getForUser(userId, jobId);
        return this.prisma.job.update({
            where: { id: jobId },
            data: {
                ...(dto.companyName ? { companyName: dto.companyName } : {}),
                ...(dto.jobTitle ? { jobTitle: dto.jobTitle } : {}),
                ...(dto.status ? { status: dto.status } : {}),
                ...(dto.appliedDate ? { appliedDate: new Date(dto.appliedDate) } : {}),
            },
        });
    }
    async deleteForUser(userId, jobId) {
        await this.getForUser(userId, jobId);
        await this.prisma.job.delete({ where: { id: jobId } });
        return { ok: true };
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JobsService);
//# sourceMappingURL=jobs.service.js.map