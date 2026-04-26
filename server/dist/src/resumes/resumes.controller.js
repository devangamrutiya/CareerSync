"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const resumes_service_1 = require("./resumes.service");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const storage = (0, multer_1.diskStorage)({
    destination: (req, file, cb) => {
        const dest = path.join(process.cwd(), 'uploads', 'resumes');
        fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const name = `${crypto.randomUUID()}${ext}`;
        cb(null, name);
    },
});
const allowedExtensions = ['.pdf', '.docx'];
const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
let ResumesController = class ResumesController {
    resumesService;
    constructor(resumesService) {
        this.resumesService = resumesService;
    }
    async optimize(req, file, jobDescription, res) {
        if (!file)
            throw new common_1.BadRequestException('Resume file is required');
        const cleanedJobDescription = (jobDescription || '').trim();
        if (!cleanedJobDescription)
            throw new common_1.BadRequestException('jobDescription is required');
        if (cleanedJobDescription.length > 10_000) {
            throw new common_1.BadRequestException('jobDescription must be 10,000 characters or fewer');
        }
        const buffer = await this.resumesService.optimizeResume({
            userId: req.user.id,
            uploadedFile: file,
            jobDescription: cleanedJobDescription,
        });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="optimized_resume.pdf"`);
        res.send(buffer);
    }
};
exports.ResumesController = ResumesController;
__decorate([
    (0, common_1.Post)('optimize'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage,
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            const mime = (file.mimetype || '').toLowerCase();
            if (!allowedExtensions.includes(ext)) {
                return cb(new common_1.BadRequestException('Only PDF/DOCX resumes are supported'), false);
            }
            if (!allowedMimeTypes.includes(mime)) {
                return cb(new common_1.BadRequestException('Unsupported file MIME type'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('jobDescription')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, Object]),
    __metadata("design:returntype", Promise)
], ResumesController.prototype, "optimize", null);
exports.ResumesController = ResumesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('resumes'),
    __metadata("design:paramtypes", [resumes_service_1.ResumesService])
], ResumesController);
//# sourceMappingURL=resumes.controller.js.map