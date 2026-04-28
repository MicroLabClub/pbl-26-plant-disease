/// <reference types="vite/client" />
import type { AuthRequest, AuthResult } from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export class ApiError extends Error {
  constructor(public status: number, public data: unknown) {
    super(`API error ${status}`);
    this.name = 'ApiError';
  }
}

async function authPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(res.status, data);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const authApi = {
  login:    (req: AuthRequest)     => authPost<AuthResult>('/api/auth/login',    req),
  register: (req: AuthRequest)     => authPost<AuthResult>('/api/auth/register', req),
  refresh:  (refreshToken: string) => authPost<AuthResult>('/api/auth/refresh',  { refreshToken }),
  logout:   (refreshToken: string) => authPost<void>('/api/auth/logout', { refreshToken }),
};