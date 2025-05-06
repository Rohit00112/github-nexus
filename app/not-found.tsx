// Simple not-found component to prevent prerendering issues
export default function NotFound() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for doesn't exist.</p>
      <a href="/">Return Home</a>
    </div>
  );
}
