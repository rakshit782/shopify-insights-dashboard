
import { NextResponse, type NextRequest } from 'next/server'

// Middleware is now a no-op since authentication is removed.
export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes)
     * - auth/ (auth-related API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|auth/).*)',
  ],
}
