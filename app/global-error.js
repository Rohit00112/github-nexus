'use client';

// Global error handler for the entire application
export default function GlobalError({ error }) {
  return (
    <html>
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>{error?.message || 'An error occurred'}</p>
          <a href="/">Return Home</a>
        </div>
      </body>
    </html>
  );
}
