
'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function login(formData: z.infer<typeof loginSchema>) {
  const origin = headers().get('origin')
  const validatedData = loginSchema.safeParse(formData)

  if (!validatedData.success) {
    return { error: 'Invalid form data.' }
  }

  const { email, password } = validatedData.data
  const supabase = createClient({ db: 'MAIN' })

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return redirect('/')
}

export async function signup(formData: z.infer<typeof loginSchema>) {
  const origin = headers().get('origin')
  const validatedData = loginSchema.safeParse(formData)

  if (!validatedData.success) {
    return { error: 'Invalid form data.' }
  }

  const { email, password } = validatedData.data
  const supabase = createClient({ db: 'MAIN' })

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // No redirect on signup, user needs to confirm their email.
  return { error: null }
}
