import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Prevent access to the _not-found route directly
  if (request.nextUrl.pathname === '/_not-found') {
    return NextResponse.redirect(new URL('/404', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/_not-found'],
};
