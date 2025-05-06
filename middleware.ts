import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for auth-related API routes
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Handle prerendering for client-side pages that require authentication
  if (
    pathname === '/issues' ||
    pathname === '/pull-requests' ||
    pathname === '/repositories' ||
    pathname.startsWith('/repositories/')
  ) {
    // During build time, Next.js will try to prerender these pages
    // We need to handle this case differently
    const isPrerendering = process.env.NODE_ENV === 'production' && !request.headers.get('x-middleware-invoke');

    if (isPrerendering) {
      // For prerendering, return a minimal response
      return new NextResponse(null, {
        status: 200,
        headers: {
          'content-type': 'text/html',
        },
      });
    }
  }

  // Handle all auth routes to prevent prerendering issues
  if (pathname.startsWith('/auth/')) {
    // For signin, redirect to GitHub OAuth
    if (pathname === '/auth/signin' || pathname.startsWith('/auth/signin')) {
      return NextResponse.redirect(new URL('/api/auth/signin/github', request.url));
    }

    // For signout, let the Pages Router handle it
    if (pathname === '/auth/signout' || pathname.startsWith('/auth/signout')) {
      return NextResponse.next();
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
    '/not-found',
    '/_not-found',
  ];

  // Check if the path starts with any valid path
  const isValidPath = validPaths.some(path =>
    pathname === path ||
    pathname.startsWith(`${path}/`) ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('favicon.ico')
  );

  // If it's not a valid path, show the not-found page
  // But don't intercept the actual not-found page or static assets
  if (!isValidPath &&
      !pathname.startsWith('/_next/') &&
      !pathname.includes('favicon.ico') &&
      pathname !== '/not-found' &&
      pathname !== '/_not-found') {

    // For prerendering, return a minimal response
    const isPrerendering = process.env.NODE_ENV === 'production' && !request.headers.get('x-middleware-invoke');
    if (isPrerendering) {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'content-type': 'text/html',
        },
      });
    }

    // Use the App Router's not-found page (only if not prerendering)
    // Ensure request.url is a valid absolute URL
    if (request.url && request.url.startsWith('http')) {
      return NextResponse.rewrite(new URL('/not-found', request.url));
    } else {
      // Fallback: return minimal response if request.url is not valid
      return new NextResponse(null, {
        status: 200,
        headers: {
          'content-type': 'text/html',
        },
      });
    }
  }

  // For /not-found and /_not-found, during prerender, return minimal response
  if ((pathname === '/not-found' || pathname === '/_not-found')) {
    const isPrerendering = process.env.NODE_ENV === 'production' && !request.headers.get('x-middleware-invoke');
    if (isPrerendering) {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'content-type': 'text/html',
        },
      });
    }
  }

  return NextResponse.next();
}

// Match all routes including client-side pages that need special handling
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon.ico|404|auth/error|auth/signout|$).*)',
    '/issues',
    '/pull-requests',
    '/repositories',
    '/repositories/:path*',
    '/api/auth/:path*'
  ],
};
