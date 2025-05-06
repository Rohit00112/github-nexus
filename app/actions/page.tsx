// Mark this page as dynamically rendered
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Import the client wrapper component
import ClientWrapper from './client-wrapper';

export default function ActionsPage() {
  return <ClientWrapper />;
}
