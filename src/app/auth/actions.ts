'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

/**
 * Signup new user
 */
export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('first-name') as string
  const lastName = formData.get('last-name') as string

  const supabase = createClient()

  // ✅ Hash password before inserting
  const passwordHash = await bcrypt.hash(password, 10)

  // 1. Insert into users
  const { data: newUser, error: userError } = await supabase
    .from('users')
    .insert({
      email,
      password_hash: passwordHash,
      role: 'sub',             // default
      license_status: 'active' // default
    })
    .select('id')
    .single()

  if (userError) {
    console.error('Signup user error:', userError)
    if (userError.code === '23505') {
      return redirect('/signup?message=A user with this email already exists.')
    }
    return redirect('/signup?message=Could not create user account.')
  }

  // 2. Insert into profiles
  const { error: profileError } = await supabase.from('profiles').insert({
    id: uuidv4(),
    user_id: newUser.id,
    first_name: firstName,
    last_name: lastName
  })

  if (profileError) {
    console.error('Signup profile error:', profileError)
    await supabase.from('users').delete().eq('id', newUser.id) // rollback
    return redirect('/signup?message=Could not create user profile.')
  }

  return redirect('/login?message=Account created successfully. Please log in.')
}

/**
 * Login existing user
 */
export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = createClient()

  // 1. Find user
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, password_hash, license_status')
    .eq('email', email)
    .single()

  if (error || !user) {
    return redirect('/login?message=Could not authenticate user.')
  }

  // 2. Check license_status
  if (user.license_status !== 'active') {
    return redirect('/login?message=Your license is inactive. Please contact support.')
  }

  // 3. Verify password
  const validPassword = await bcrypt.compare(password, user.password_hash)
  if (!validPassword) {
    return redirect('/login?message=Invalid credentials.')
  }

  // 4. Set cookie BEFORE redirect
  const cookieStore = cookies()
  cookieStore.set({
    name: 'user-session',
    value: user.id.toString(),
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 // 24h
  })

  return redirect('/')
}
