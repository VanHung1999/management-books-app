import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define auth routes that don't require authentication
const authRoutes = ['/login', '/register', '/forgot-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if user is authenticated using cookies
  const hasAuthToken = request.cookies.has('auth-token')
  const hasCurrentUser = request.cookies.has('currentUser')
  const isAuthenticated = hasAuthToken || hasCurrentUser
  
  // Debug logging
  console.log('Middleware:', {
    pathname,
    hasAuthToken,
    hasCurrentUser,
    isAuthenticated,
    cookies: request.cookies.getAll()
  })
  
  // If user is not authenticated and trying to access any non-auth route
  if (!isAuthenticated && !authRoutes.some(route => pathname.startsWith(route))) {
    console.log('Redirecting to login:', pathname)
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }
  
  // If user is authenticated and trying to access auth routes, redirect to home
  if (isAuthenticated && authRoutes.some(route => pathname.startsWith(route))) {
    console.log('Redirecting to home:', pathname)
    const homeUrl = new URL('/', request.url)
    return NextResponse.redirect(homeUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
