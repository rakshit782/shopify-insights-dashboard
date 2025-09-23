
'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = createClient()

  // Find user by email
  const { data: user, error: findError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (findError || !user) {
    return redirect('/login?message=Could not find user with that email.')
  }
  
  // WARNING: This is an insecure password check. 
  // Passwords should be hashed and compared securely.
  if (user.password !== password) {
    return redirect('/login?message=Incorrect password.')
  }

  // Set a cookie to maintain the session. This is a simplified session management.
  const cookieStore = headers()
  // In a real app, you would use a secure JWT or session token here.
  // For simplicity, we'll store the user ID.
  const response = redirect('/')
  response.cookies.set('user-session', user.id, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 // 24 hours
  })

  return response;
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('first-name') as string
  const lastName = formData.get('last-name') as string
  const supabase = createClient()

  // WARNING: Storing plaintext passwords is a major security risk.
  const { error } = await supabase.from('users').insert({
    email,
    password, // This should be a hashed password
    first_name: firstName,
    last_name: lastName,
  })

  if (error) {
    console.error('Signup error:', error);
    if (error.code === '23505') { // Unique constraint violation
        return redirect('/signup?message=A user with this email already exists.')
    }
    return redirect('/signup?message=Could not create user account. Please try again.')
  }

  return redirect('/login?message=Account created successfully. Please log in.')
}
