
'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1, 'First name is required.'),
    lastName: z.string().min(1, 'Last name is required.'),
});

export async function login(formData: z.infer<typeof loginSchema>) {
  const origin = headers().get('origin')
  const validatedData = loginSchema.safeParse(formData)

  if (!validatedData.success) {
    return { error: 'Invalid form data.' }
  }

  const { email, password } = validatedData.data
  const supabase = createClient({ db: 'MAIN' })

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
     if (error.message.includes('Email not confirmed')) {
      return { error: 'Email not confirmed. Please check your inbox for a confirmation link.' };
    }
    return { error: error.message }
  }

  return redirect('/')
}

export async function signup(formData: z.infer<typeof signupSchema>) {
  const origin = headers().get('origin')
  const validatedData = signupSchema.safeParse(formData)

  if (!validatedData.success) {
    return { error: 'Invalid form data.' }
  }

  const { email, password, firstName, lastName } = validatedData.data
  const supabase = createClient({ db: 'MAIN' })

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
          first_name: firstName,
          last_name: lastName,
      }
    },
  })

  if (error) {
    return { error: error.message }
  }

  // No redirect on signup, user needs to confirm their email.
  return { error: null }
}
