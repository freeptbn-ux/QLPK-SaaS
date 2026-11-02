import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { User } from '@supabase/supabase-js'

export type UpdateSessionResult = NextResponse & {
  response: NextResponse
  user: User | null
}

export async function updateSession(request: NextRequest): Promise<UpdateSessionResult> {
  let supabaseResponse = NextResponse.next({
    request,
    status: 200,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
            status: 200,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake can make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isPublicPath =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api')

  if (!user && !isPublicPath) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    const redirectResponse = NextResponse.redirect(url)
    return Object.assign(redirectResponse, { response: redirectResponse, user })
  }

  // Nếu đã login mà vào /login thì redirect về /patients
  if (user && pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/patients'
    const redirectResponse = NextResponse.redirect(url)
    return Object.assign(redirectResponse, { response: redirectResponse, user })
  }

  // Nếu vào root / thì redirect về /patients
  if (user && pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/patients'
    const redirectResponse = NextResponse.redirect(url)
    return Object.assign(redirectResponse, { response: redirectResponse, user })
  }

  return Object.assign(supabaseResponse, { response: supabaseResponse, user })
}
