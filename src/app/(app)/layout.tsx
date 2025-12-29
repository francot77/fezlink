import type { ReactNode } from "react";
import SessionWrapper from "@/components/SessionWrapper";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <SessionWrapper>
    {children}
  </SessionWrapper>
}
