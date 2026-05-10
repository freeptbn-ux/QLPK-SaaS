import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';
import { createServerClient } from '@supabase/ssr';

// Mock Supabase SSR
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

// Mock next/server
vi.mock('next/server', () => {
  const next = vi.fn((opts) => ({
    cookies: {
      set: vi.fn(),
      getAll: vi.fn(() => []),
    },
    ...opts,
  }));
  const redirect = vi.fn((url) => ({
    status: 302,
    headers: { location: url.toString() },
    url: url.toString(),
  }));
  
  return {
    NextResponse: {
      next,
      redirect,
    },
  };
});

describe('Middleware Security', () => {
  const mockUser = { id: 'test-user' };
  
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
  });

  it('should redirect to /login if user is not authenticated and trying to access dashboard', async () => {
    // Setup mock supabase to return no user
    (createServerClient as any).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    });

    const req = {
      nextUrl: {
        clone: () => new URL('http://localhost:3000/dashboard'),
        pathname: '/dashboard',
        startsWith: (path: string) => '/dashboard'.startsWith(path),
      },
      cookies: {
        getAll: vi.fn(() => []),
        set: vi.fn(),
      },
    } as unknown as NextRequest;

    await updateSession(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectUrl = (NextResponse.redirect as any).mock.calls[0][0];
    expect(redirectUrl.pathname).toBe('/login');
  });

  it('should allow access if user is authenticated', async () => {
    // Setup mock supabase to return a user
    (createServerClient as any).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
    });

    const req = {
      nextUrl: {
        clone: () => new URL('http://localhost:3000/dashboard'),
        pathname: '/dashboard',
        startsWith: (path: string) => '/dashboard'.startsWith(path),
      },
      cookies: {
        getAll: vi.fn(() => []),
        set: vi.fn(),
      },
    } as unknown as NextRequest;

    await updateSession(req);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it('should redirect to /patients if user is authenticated and trying to access /login', async () => {
    (createServerClient as any).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
    });

    const req = {
      nextUrl: {
        clone: () => new URL('http://localhost:3000/login'),
        pathname: '/login',
        startsWith: (path: string) => '/login'.startsWith(path),
      },
      cookies: {
        getAll: vi.fn(() => []),
        set: vi.fn(),
      },
    } as unknown as NextRequest;

    await updateSession(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectUrl = (NextResponse.redirect as any).mock.calls[0][0];
    expect(redirectUrl.pathname).toBe('/patients');
  });
});
