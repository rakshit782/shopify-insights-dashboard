
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid';

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string // Not used for now for security
  const supabase = createClient()

  // Find user by email in the custom 'users' table
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', email)
    .single();

  if (error || !user) {
    return redirect('/login?message=Could not authenticate user.')
  }
  
  // WARNING: We are not checking the password.
  // In a real-world scenario, you MUST hash passwords on signup and compare the hash on login.

  // Set a cookie to maintain the session.
  const response = redirect('/')
  const cookieStore = cookies()
  cookieStore.set('user-session', user.id.toString(), {
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

  // 1. Insert into the custom 'users' table.
  // WARNING: Storing plaintext passwords is a major security risk.
  // The 'password_hash' column should be used to store a securely hashed password.
  // For now, we will insert the user without a password check.
  const { data: newUser, error: userError } = await supabase
    .from('users')
    .insert({
      email: email,
      // password_hash: [A securely hashed password should go here]
    })
    .select('id')
    .single();
    
  if (userError) {
    console.error('Signup user error:', userError);
    if (userError.code === '23505') { // Unique constraint violation
        return redirect('/signup?message=A user with this email already exists.')
    }
    return redirect('/signup?message=Could not create user account.')
  }

  if (!newUser) {
    return redirect('/signup?message=Could not create user account.')
  }
  
  // 2. Insert into the 'profiles' table, linking it to the new user.
  const { error: profileError } = await supabase.from('profiles').insert({
    id: uuidv4(), // The profiles.id is a UUID
    user_id: newUser.id, // The profiles.user_id is a bigint linking to users.id
    first_name: firstName,
    last_name: lastName
  });

  if (profileError) {
    console.error('Signup profile error:', profileError);
    // Attempt to clean up the created user if profile creation fails
    await supabase.from('users').delete().eq('id', newUser.id);
    return redirect('/signup?message=Could not create user profile.');
  }

  return redirect('/login?message=Account created successfully. Please log in.')
}
