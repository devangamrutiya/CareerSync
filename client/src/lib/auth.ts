export type AuthUser = { id: string; email: string };

const TOKEN_KEY = 'jobsync.token';
const USER_KEY = 'jobsync.user';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser): void {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthUser(): void {
  window.localStorage.removeItem(USER_KEY);
}

export function signOut(): void {
  clearAccessToken();
  clearAuthUser();
}
