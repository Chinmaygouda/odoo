'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

export function GoogleWrapper({ children }: { children: React.ReactNode }) {
  // Use NEXT_PUBLIC_GOOGLE_CLIENT_ID from environment
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE';
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
