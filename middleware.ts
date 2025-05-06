import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle not-found and 404 routes
  if (request.nextUrl.pathname === '/_not-found' ||
      request.nextUrl.pathname.includes('/_not-found') ||
      request.nextUrl.pathname.includes('not-found') ||
      request.nextUrl.pathname === '/404' ||
      request.nextUrl.pathname.includes('/404')) {

    // Create a simple HTML response for 404
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>404 - Page Not Found</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; text-align: center; }
            h1 { font-size: 2rem; margin-bottom: 1rem; }
            a { color: #0070f3; text-decoration: none; }
          </style>
        </head>
        <body>
          <h1>404 - Page Not Found</h1>
          <p>The page you are looking for doesn't exist or has been moved.</p>
          <a href="/">Return Home</a>
        </body>
      </html>`,
      {
        status: 404,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }

  return NextResponse.next();
}

// Match all routes that might be related to not-found or 404
export const config = {
  matcher: ['/_not-found', '/404', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
