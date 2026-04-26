import { getAccessToken } from './auth';

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://localhost:3001';
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return 'Please check your input. Email must be valid and passwords must be at least 8 characters.';
    }

    if (error.status === 401) {
      return 'Incorrect email or password.';
    }

    if (error.status === 409) {
      return 'An account with this email already exists. Try signing in instead.';
    }

    if (error.status >= 500) {
      return 'The server hit an unexpected error. Please try again in a moment.';
    }

    return error.message || fallback;
  }

  if (error instanceof TypeError) {
    return `Cannot reach the API server at ${getApiBaseUrl()}. Check that the backend is running and NEXT_PUBLIC_API_URL is correct.`;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

export async function apiJson<TResponse>(
  path: string,
  options?: {
    method?: string;
    body?: Json;
    token?: string;
  },
): Promise<TResponse> {
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const token = options?.token ?? getAccessToken();

  const res = await fetch(url, {
    method: options?.method ?? (options?.body ? 'POST' : 'GET'),
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => '');

  if (!res.ok) {
    const messageFromPayload =
      typeof payload === 'object' && payload !== null && 'message' in payload
        ? Array.isArray((payload as Record<string, unknown>).message)
          ? String((payload as Record<string, unknown>).message)
          : String((payload as Record<string, unknown>).message)
        : null;
    const message = messageFromPayload || `Request failed with ${res.status}`;
    throw new ApiError(message, res.status, payload);
  }

  return payload as TResponse;
}
