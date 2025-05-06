'use client';

import dynamic from 'next/dynamic';

// Import the client component with no SSR to avoid prerendering issues
const ActionsClient = dynamic(() => import('./client'), { ssr: false });

export default function ActionsPage() {
  return <ActionsClient />;
}
