import type { ReactNode } from 'react';
import SessionWrapper from '@/components/SessionWrapper';

export default async function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SessionWrapper>
      {children}
    </SessionWrapper>
  );
}
