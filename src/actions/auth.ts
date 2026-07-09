'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// In-memory rate limiter: Map<normalizedEmail, { count, windowStart }>
// Cleared when the server process restarts. For multi-instance, use Redis.
const loginAttempts = new Map<string, { count: number; windowStart: number }>()
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000  // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 10

function checkRateLimit(email: string): { blocked: boolean; remainingMs?: number } {
  const key = email.toLowerCase().trim()
  const now = Date.now()
  const record = loginAttempts.get(key)

  if (!record || (now - record.windowStart) > RATE_LIMIT_WINDOW_MS) {
    // Fresh window
    loginAttempts.set(key, { count: 1, windowStart: now })
    return { blocked: false }
  }

  if (record.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    const remainingMs = RATE_LIMIT_WINDOW_MS - (now - record.windowStart)
    return { blocked: true, remainingMs }
  }

  record.count++
  return { blocked: false }
}

export async function loginAction(formData: FormData) {
  const supabase = await createClient()

  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  // Rate limit check
  const rateCheck = checkRateLimit(email)
  if (rateCheck.blocked) {
    const minutes = Math.ceil((rateCheck.remainingMs ?? 0) / 60000)
    return { error: `Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau ${minutes} phút.` }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // SECURITY: Do NOT return the raw Supabase error message.
    // Raw messages like "Email not confirmed" or "Invalid login credentials"
    // allow attackers to enumerate valid email addresses.
    return { error: 'Email hoặc mật khẩu không chính xác.' }
  }

  // On success, clear the rate limit for this email
  loginAttempts.delete(email.toLowerCase().trim())

  revalidatePath('/', 'layout')
  redirect('/patients')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
