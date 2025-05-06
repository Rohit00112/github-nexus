import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Special handling for auth routes to prevent prerendering issues
  if (pathname === '/auth/signin' || pathname.startsWith('/auth/signin')) {
    // Redirect to the API auth endpoint which will handle the GitHub OAuth flow
    return NextResponse.redirect(new URL('/api/auth/signin/github', request.url));
  }

  // Check if the path exists in our application
  // This is a simplified check - in a real app, you'd have a more comprehensive check
  const validPaths = [
    '/',
    '/auth/signout',
    '/auth/error',
    '/issues',
    '/pull-requests',
    '/repositories',
    '/api/auth',
  ];

  // Check if the path starts with any valid path
  const isValidPath = validPaths.some(path =>
    pathname === path ||
    pathname.startsWith(`${path}/`) ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('favicon.ico')
  );

  // If it's not a valid path or it's explicitly a 404/not-found path, return 404
  if (!isValidPath ||
      pathname === '/_not-found' ||
      pathname.includes('/_not-found') ||
      pathname.includes('not-found') ||
      pathname === '/404' ||
      pathname.includes('/404')) {

    // Create a simple HTML response for 404
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>404 - Page Not Found</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              padding: 2rem;
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background-color: #f9fafb;
              color: #111827;
            }
            .container {
              max-width: 28rem;
              padding: 2rem;
              background-color: white;
              border-radius: 0.5rem;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            h1 {
              font-size: 2.5rem;
              font-weight: 700;
              margin-bottom: 1rem;
              color: #1f2937;
            }
            p {
              margin-bottom: 1.5rem;
              color: #4b5563;
              font-size: 1.125rem;
            }
            a {
              display: inline-block;
              background-color: #0070f3;
              color: white;
              text-decoration: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.375rem;
              font-weight: 500;
              transition: background-color 0.15s ease;
            }
            a:hover {
              background-color: #0051a8;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>404</h1>
            <p>The page you are looking for doesn't exist or has been moved.</p>
            <a href="/">Return Home</a>
          </div>
        </body>
      </html>`,
      {
        status: 404,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        },
      }
    );
  }

  return NextResponse.next();
}

// Match all routes except static assets and auth callback
export const config = {
  matcher: ['/((?!api/auth/callback|_next/static|_next/image|favicon.ico).*)'],
};
