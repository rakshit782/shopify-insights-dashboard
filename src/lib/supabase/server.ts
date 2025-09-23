
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for server-side usage.
 * Can connect to either the MAIN or DATA database based on options.
 * Uses the user's authentication context from cookies.
 */
export function createClient(options: { db: 'MAIN' | 'DATA' }) {
  const cookieStore = cookies();

  let supabaseUrl: string | undefined;
  let supabaseKey: string | undefined;

  if (options.db === 'MAIN') {
    supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  } else if (options.db === 'DATA') {
    // IMPORTANT: Even for the DATA db, we use the public anon key for the initial client
    // so that it can read the user's auth cookie. We'll use the service key for specific
    // admin-level operations within the functions that need it, but the base client
    // needs to be user-aware.
    supabaseUrl = process.env.SUPABASE_URL_DATA;
    supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY_DATA; 
  }

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(`Supabase credentials for ${options.db} database are not configured.`);
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
