import type { ReactNode } from 'react';
import SessionWrapper from '@/components/SessionWrapper';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const [messages, locale] = await Promise.all([getMessages(), getLocale()]);
  return (
    <SessionWrapper>
      <NextIntlClientProvider messages={messages} locale={locale}>
        {children}
      </NextIntlClientProvider>
    </SessionWrapper>
  );
}
