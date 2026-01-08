// src/components/SessionWrapper.tsx
'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

function SessionAuthCheck({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if:
    // 1. We finished loading the session (status !== 'loading')
    // 2. There is no active session (status === 'unauthenticated' or !session)
    // 3. We are on a protected route (e.g. /dashboard)
    if (status === 'unauthenticated' && pathname?.startsWith('/dashboard')) {
      // Redirect to login, preserving the current page as callbackUrl
      const loginUrl = new URL('/login', window.location.origin);
      loginUrl.searchParams.set('callbackUrl', pathname);
      router.push(loginUrl.toString());
    }
  }, [session, status, router, pathname]);

  return <>{children}</>;
}

export default function SessionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionAuthCheck>{children}</SessionAuthCheck>
    </SessionProvider>
  );
}
