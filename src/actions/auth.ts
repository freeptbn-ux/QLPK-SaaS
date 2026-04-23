'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const supabase = await createClient()

  let email = formData.get('email') as string
  let password = formData.get('password') as string

  // Local dev shortcut - only works in development environment
  if (process.env.NODE_ENV === 'development' && email === 'admin' && password === '1') {
    email = process.env.DEV_ADMIN_EMAIL || email
    password = process.env.DEV_ADMIN_PASSWORD || password
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/patients')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
