
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import 'dotenv/config';

// This function creates a Supabase client that can be used in Server Components,
// Server Actions, and Route Handlers. It is essential for server-side operations
// that need to interact with your Supabase projects.

// It now distinguishes between the 'MAIN' database (for credentials, profiles)
// and the 'DATA' database (for synced product information).

export function createSupabaseServerClient(database: 'MAIN' | 'DATA') {
  const cookieStore = cookies();

  let supabaseUrl: string | undefined;
  let supabaseServiceRoleKey: string | undefined;

  if (database === 'MAIN') {
    supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY_MAIN;
  } else if (database === 'DATA') {
    supabaseUrl = process.env.SUPABASE_URL_DATA;
    supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY_DATA;
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Supabase credentials for the ${database} database are not set. Check your .env file.`);
    }
    // We create a "do-nothing" client if credentials are not provided
    // This avoids hard crashes but operations will fail.
    // The UI should check for the presence of env vars and show an error state.
    const dummyClient = {
        from: () => ({
            select: async () => ({ error: { message: `Supabase for ${database} not configured.`}, data: null }),
            insert: async () => ({ error: { message: `Supabase for ${database} not configured.`}, data: null }),
            update: async () => ({ error: { message: `Supabase for ${database} not configured.`}, data: null }),
            delete: async () => ({ error: { message: `Supabase for ${database} not configured.`}, data: null }),
            upsert: async () => ({ error: { message: `Supabase for ${database} not configured.`}, data: null }),
        }),
    };
    return dummyClient as any;
  }

  // Create and return a new Supabase client with the service_role key
  return createServerClient(supabaseUrl, supabaseServiceRoleKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // This can happen in Server Components. It's safe to ignore.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
            cookieStore.set({ name, value: '', ...options });
        } catch (error) {
            // This can happen in Server Components. It's safe to ignore.
        }
      },
    },
  });
}

    