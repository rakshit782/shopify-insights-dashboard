
import { createBrowserClient } from '@supabase/ssr'

export function createClient(db: 'MAIN' | 'DATA' = 'MAIN') {
  let url: string | undefined;
  let anonKey: string | undefined;

  if (db === 'MAIN') {
    url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  } else {
    // Note: The DATA database should not typically be accessed from the client-side.
    // This is here for completeness but should be used with caution.
    url = process.env.NEXT_PUBLIC_SUPABASE_URL_DATA;
    anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_DATA;
  }
  
  if (!url || !anonKey) {
    throw new Error(`Supabase client-side credentials for ${db} are not configured.`);
  }

  return createBrowserClient(url, anonKey)
}
