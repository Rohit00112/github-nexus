// This is a fallback signin page for compatibility with older Next.js routing
import { useEffect } from 'react';
import { signIn } from 'next-auth/react';

export default function SignInPage() {
  useEffect(() => {
    // Redirect to GitHub sign-in
    signIn('github', { callbackUrl: '/' });
  }, []);
  
  return null;
}
