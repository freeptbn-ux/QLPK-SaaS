import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'
import { createServerClient } from '@supabase/ssr'

const PROTECTED_PREFIXES = ['/patients', '/medicines', '/prescriptions', '/settings', '/statistics', '/dose-calculator']
const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password']

export async function proxy(request: NextRequest) {
  // Generate a cryptographically random nonce for this request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // Build the CSP header
  const isDev = process.env.NODE_ENV === 'development'
  const cspHeader = [
    "default-src 'self'",
    // In production: nonce + strict-dynamic (no unsafe-eval)
    // In development: add unsafe-eval for React's dev tools
    isDev
      ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
      : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",      // Keep for Tailwind + component libs
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "frame-ancestors 'none'",
    "connect-src 'self' https://generativelanguage.googleapis.com",
    "upgrade-insecure-requests",
  ].join('; ')

  // Inject nonce into the request so Server Components can read it
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', cspHeader)

  // Call updateSession with the modified request
  const newRequest = new NextRequest(request, {
    headers: requestHeaders,
  })
  let response = await updateSession(newRequest)

  // Apply CSP and nonce to the response headers
  response.headers.set('Content-Security-Policy', cspHeader)

  // --- Route Guard (from Phase 02) ---
  const { pathname } = request.nextUrl
  const isPublicPath = PUBLIC_PATHS.some(p => pathname.startsWith(p))
  if (isPublicPath) return response

  const isProtectedPath = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
  if (!isProtectedPath) return response

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {},
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    const redirectResp = NextResponse.redirect(loginUrl)
    redirectResp.headers.set('Content-Security-Policy', cspHeader)
    return redirectResp
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

