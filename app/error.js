'use client';

// Simple error component that will be used for all errors including 404
export default function Error({ error, reset }) {
  return (
    <div>
      <h1>Something went wrong</h1>
      <p>{error?.message || 'An error occurred'}</p>
      <button onClick={reset}>Try again</button>
      <a href="/">Return Home</a>
    </div>
  );
}
