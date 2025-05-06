import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for auth-related API routes
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Handle all auth routes to prevent prerendering issues
  if (pathname.startsWith('/auth/')) {
    // For signin, redirect to GitHub OAuth
    if (pathname === '/auth/signin' || pathname.startsWith('/auth/signin')) {
      return NextResponse.redirect(new URL('/api/auth/signin/github', request.url));
    }

    // For signout, redirect to API signout
    if (pathname === '/auth/signout' || pathname.startsWith('/auth/signout')) {
      return NextResponse.redirect(new URL('/api/auth/signout', request.url));
    }

    // For auth error, let the Pages Router handle it
    if (pathname === '/auth/error' || pathname.startsWith('/auth/error')) {
      return NextResponse.next();
    }
  }

  // Check if the path exists in our application
  const validPaths = [
    '/',
    '/issues',
    '/pull-requests',
    '/repositories',
  ];

  // Check if the path starts with any valid path
  const isValidPath = validPaths.some(path =>
    pathname === path ||
    pathname.startsWith(`${path}/`) ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('favicon.ico')
  );

  // If it's not a valid path, redirect to the 404 page
  // But don't intercept the actual not-found page or 404 page
  if (!isValidPath &&
      !pathname.startsWith('/_next/') &&
      !pathname.includes('favicon.ico')) {

    // Redirect to the 404 page in the Pages Router
    return NextResponse.rewrite(new URL('/404', request.url));
  }

  return NextResponse.next();
}

// Match all routes except static assets, not-found pages, auth/error, and auth callback
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon.ico|404|not-found|auth/error).*)',
    '/api/auth/:path*'
  ],
};
