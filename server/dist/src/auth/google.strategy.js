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
exports.GoogleStrategy = void 0;
const passport_1 = require("@nestjs/passport");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const env_1 = require("../config/env");
let GoogleStrategy = class GoogleStrategy extends (0, passport_1.PassportStrategy)(passport_google_oauth20_1.Strategy, 'google') {
    usersService;
    constructor(usersService) {
        const clientID = process.env.GOOGLE_CLIENT_ID?.trim();
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
        if ((0, env_1.isProduction)() && !(0, env_1.isGoogleOAuthConfigured)()) {
            throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required in production');
        }
        super({
            clientID: clientID || 'placeholder_client_id',
            clientSecret: clientSecret || 'placeholder_client_secret',
            callbackURL: process.env.GOOGLE_CALLBACK_URL ||
                'http://localhost:3001/auth/google/callback',
        });
        this.usersService = usersService;
    }
    async validate(accessToken, refreshToken, profile, done) {
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
};
exports.GoogleStrategy = GoogleStrategy;
exports.GoogleStrategy = GoogleStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], GoogleStrategy);
//# sourceMappingURL=google.strategy.js.map