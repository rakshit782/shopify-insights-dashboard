
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
  let placeholderUrl: string;
  let urlEnvName: string;
  let keyEnvName: string;


  if (database === 'MAIN') {
    urlEnvName = 'NEXT_PUBLIC_SUPABASE_URL';
    keyEnvName = 'SUPABASE_SERVICE_ROLE_KEY_MAIN';
    supabaseUrl = process.env[urlEnvName];
    supabaseServiceRoleKey = process.env[keyEnvName];
    placeholderUrl = "your-supabase-main-url";
  } else if (database === 'DATA') {
    urlEnvName = 'SUPABASE_URL_DATA';
    keyEnvName = 'SUPABASE_SERVICE_ROLE_KEY_DATA';
    supabaseUrl = process.env[urlEnvName];
    supabaseServiceRoleKey = process.env[keyEnvName];
    placeholderUrl = "your-supabase-data-url";
  } else {
    // Should not happen, but good to have a fallback
    return createDummyClient('UNKNOWN');
  }

  // Check for missing or placeholder credentials
  if (!supabaseUrl || !supabaseServiceRoleKey || supabaseUrl.includes(placeholderUrl)) {
    console.error(`Supabase credentials for the ${database} database are not set or are placeholders.`);
    console.error(`Please ensure ${urlEnvName} and ${keyEnvName} are set in your environment (e.g., in Vercel project settings).`);
    
    // Return a do-nothing client to prevent crashes
    return createDummyClient(database);
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

function createDummyClient(database: 'MAIN' | 'DATA' | 'UNKNOWN') {
    const errorMessage = `Supabase for ${database} not configured.`;
    const errorResponse = { error: { message: errorMessage }, data: null, count: null };

    const dummyQueryBuilder: any = {
        select: () => dummyQueryBuilder,
        insert: () => dummyQueryBuilder,
        update: () => dummyQueryBuilder,
        delete: () => dummyQueryBuilder,
        upsert: () => dummyQueryBuilder,
        eq: () => dummyQueryBuilder,
        limit: () => dummyQueryBuilder,
        order: () => dummyQueryBuilder,
        single: async () => ({ ...errorResponse, data: null }), // single returns one object
        then: (resolve: any) => resolve(errorResponse), // Allow awaiting the query builder
    };
    
    return {
        from: () => dummyQueryBuilder,
    } as any;
}
    
