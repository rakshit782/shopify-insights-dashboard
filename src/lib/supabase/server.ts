
// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for server-side usage.
 * Can connect to either the MAIN or DATA database based on options.
 * Uses the service role key — make sure this is never exposed to the client/browser.
 */
export function createClient(options: { db: 'MAIN' | 'DATA' }) {
  const cookieStore = cookies();

  let supabaseUrl: string | undefined;
  let supabaseKey: string | undefined;

  if (options.db === 'MAIN') {
    supabaseUrl = process.env.SUPABASE_URL_MAIN;
    supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY_MAIN;
  } else if (options.db === 'DATA') {
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
            // ignore in server components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // ignore in server components
          }
        },
      },
    }
  )
}
