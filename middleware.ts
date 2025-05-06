import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Prevent access to the _not-found route directly
  if (request.nextUrl.pathname === '/_not-found' ||
      request.nextUrl.pathname.includes('/_not-found') ||
      request.nextUrl.pathname.includes('not-found')) {
    return NextResponse.redirect(new URL('/404', request.url));
  }

  return NextResponse.next();
}

// Match all routes that might be related to not-found
export const config = {
  matcher: ['/_not-found', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
