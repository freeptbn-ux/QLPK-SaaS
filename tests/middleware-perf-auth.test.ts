// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { proxy } from '@/proxy';
import { createServerClient } from '@supabase/ssr';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  const next = vi.fn((opts) => ({
    headers: new Headers(opts?.headers || {}),
    cookies: {
      set: vi.fn(),
      getAll: vi.fn(() => []),
    },
    ...opts,
  }));
  const redirect = vi.fn((url) => ({
    status: 302,
    headers: new Headers({ location: url.toString() }),
    url: url.toString(),
  }));
  return {
    ...actual,
    NextResponse: {
      next,
      redirect,
    },
  };
});

describe('Phase 01 Test: Middleware Auth Performance & Single Round-Trip', () => {
  let getUserMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

    getUserMock = vi.fn();
    (createServerClient as any).mockReturnValue({
      auth: {
        getUser: getUserMock,
      },
    });
  });

  it('calls getUser at most once for protected route and redirects unauthenticated user', async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });

    const req = new NextRequest(new URL('http://localhost:3000/patients'));
    const res = await proxy(req);

    expect(getUserMock).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toContain('/login?redirectTo=%2Fpatients');
    expect(res.headers.get('Content-Security-Policy')).toBeTruthy();
  });

  it('calls getUser at most once for authenticated user on protected route', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });

    const req = new NextRequest(new URL('http://localhost:3000/prescriptions'));
    const res = await proxy(req);

    expect(getUserMock).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Security-Policy')).toBeTruthy();
  });

  it('redirects authenticated user visiting /login to /patients with single getUser call', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });

    const req = new NextRequest(new URL('http://localhost:3000/login'));
    const res = await proxy(req);

    expect(getUserMock).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toContain('/patients');
  });

  it('allows unauthenticated user visiting public routes like /signup without redirecting', async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });

    const req = new NextRequest(new URL('http://localhost:3000/signup'));
    const res = await proxy(req);

    expect(getUserMock).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Security-Policy')).toBeTruthy();
  });

  it('redirects authenticated user visiting / to /patients with single getUser call', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });

    const req = new NextRequest(new URL('http://localhost:3000/'));
    const res = await proxy(req);

    expect(getUserMock).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toContain('/patients');
  });
});
