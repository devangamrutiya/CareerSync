const DEFAULT_LOCAL_ORIGIN = 'http://localhost:3000';

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;

  if (isProduction()) {
    throw new Error('JWT_SECRET is required in production');
  }

  return 'supersecret123';
}

export function getCorsOrigins(): string[] {
  const explicit = process.env.CORS_ORIGINS?.trim();
  if (explicit) {
    return explicit
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  const webOrigin = process.env.WEB_ORIGIN?.trim();
  const nextPublicWebOrigin = process.env.NEXT_PUBLIC_WEB_ORIGIN?.trim();
  const origins = [webOrigin, nextPublicWebOrigin].filter(Boolean) as string[];

  return origins.length > 0 ? origins : [DEFAULT_LOCAL_ORIGIN];
}

export function isGoogleOAuthConfigured(): boolean {
  return (
    Boolean(process.env.GOOGLE_CLIENT_ID?.trim()) &&
    Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim())
  );
}

export function shouldTrustProxy(): boolean {
  const raw = process.env.TRUST_PROXY?.trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}
