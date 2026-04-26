# Production Hardening Guide

## Current State Implemented
The project now includes:
- Validation-first auth and job APIs
- Auth endpoint rate limiting for login/register
- Helmet security headers in server bootstrap
- CORS origin allow-list support via `CORS_ORIGINS`
- Google OAuth config checks with guard-level failure when not configured
- Resume upload extension and MIME validation
- Temporary uploaded-file cleanup after resume processing

## Environment Variables (Server)
Required for production:
- `NODE_ENV=production`
- `JWT_SECRET=<long-random-secret>`
- `WEB_ORIGIN=<frontend-origin>`
- `CORS_ORIGINS=<comma-separated-allowed-origins>`
- `GOOGLE_CLIENT_ID=<oauth-client-id>`
- `GOOGLE_CLIENT_SECRET=<oauth-client-secret>`
- `GOOGLE_CALLBACK_URL=<oauth-callback-url>`

Recommended:
- `TRUST_PROXY=1` when app runs behind a reverse proxy/load balancer
- `OLLAMA_URL=<internal-ollama-endpoint>`
- `OLLAMA_MODEL=<model-name>`

## Rate Limiting Notes
Current guard limits:
- `/auth/register`: 8 requests per minute per IP/path
- `/auth/login`: 12 requests per minute per IP/path

This is an in-memory guard suitable for a single-instance deployment.
For multi-instance production, migrate to a distributed store (Redis-backed throttling).

## CSP Rollout Plan
Current server uses Helmet with `contentSecurityPolicy: false` for compatibility.
To harden:
1. Enable CSP in report-only mode first.
2. Capture violations for frontend assets, Next.js runtime scripts, and API calls.
3. Add a strict policy with only required origins.
4. Move from report-only to enforce mode after no critical violations remain.

Suggested initial policy skeleton:
- `default-src 'self'`
- `script-src 'self'`
- `style-src 'self' 'unsafe-inline'` (temporary until nonce/hash strategy)
- `img-src 'self' data: blob:`
- `connect-src 'self' <api-origin>`
- `frame-ancestors 'none'`

## Cookie-Based Auth Migration Plan
Current auth uses localStorage JWT for MVP speed.
To migrate to production-safe cookie auth:
1. Add refresh token table with token hashing and rotation metadata.
2. Issue short-lived access token + long-lived refresh token in HttpOnly cookie.
3. Add `/auth/refresh` endpoint with rotation and replay detection.
4. Add `/auth/logout` endpoint to revoke current refresh token.
5. Set cookie flags: `HttpOnly`, `Secure`, `SameSite=Lax` (or `Strict` where possible).
6. Add CSRF protection for state-changing cookie-auth routes.
7. Update client API layer to rely on cookie session (remove localStorage token dependency).

## Deployment Checklist
1. Rotate exposed OAuth credentials and update server env.
2. Set production-only secrets and origins.
3. Run `npm run lint` and test suites for client/server.
4. Verify OAuth callback, login/register, dashboard CRUD, Gmail sync, and resume optimizer.
5. Enable log/monitoring for auth failure spikes and upload failures.
6. Apply backup and retention policy for DB and uploaded artifacts.
