
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // The middleware needs the public URL and anon key to create a client
  // that can read the user's auth cookie.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase public credentials are not set in environment variables for middleware.');
    // This response will be shown if the app is not configured correctly.
    return new NextResponse('Internal Server Error: Application is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env file.', { status: 500 });
  }

  const { supabase, response } = createClient(request, supabaseUrl, supabaseAnonKey);

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // If the user is not logged in and not on the login page, redirect them there.
  if (!session && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If the user is logged in and trying to access the login page, redirect them to the root.
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes for now, could be protected later)
     * - auth/ (auth-related API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|auth/).*)',
  ],
}
