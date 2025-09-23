
import { NextResponse, type NextRequest } from 'next/server'

// We are simplifying middleware as we are not using Supabase's session management
export async function middleware(request: NextRequest) {
  // Check for the custom session cookie
  const session = request.cookies.get('user-session');
  const { pathname } = request.nextUrl;

  // If no session and not on an auth page, redirect to login
  if (!session && pathname !== '/login' && pathname !== '/signup') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there is a session and the user is trying to access auth pages, redirect to home
  if (session && (pathname === '/login' || pathname === '/signup')) {
     return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
