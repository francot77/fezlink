import type { ReactNode } from "react";
import SessionWrapper from "@/components/SessionWrapper";
import { NextIntlClientProvider } from "next-intl";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <SessionWrapper>
    <NextIntlClientProvider>
      {children}
    </NextIntlClientProvider>
  </SessionWrapper>
}
