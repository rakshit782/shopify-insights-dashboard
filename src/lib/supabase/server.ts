// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for server-side usage.
 * Uses the service role key — make sure this is never exposed to the client/browser.
 */
export async function createClient() {
  // handle both sync and async cookies() depending on Next.js version
  const cookieStore = await Promise.resolve(cookies())

  return createServerClient(
    process.env.SUPABASE_URL_MAIN!,
    process.env.SUPABASE_SERVICE_ROLE_KEY_MAIN!,
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
