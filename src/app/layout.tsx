import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from 'sonner';
import "./globals.css";
import {
  ClerkProvider
} from '@clerk/nextjs'
const workSans = Work_Sans({
  variable: "--font-worksans",
  subsets: ["latin"],
  weight: ["300", "500"]
});



export const metadata: Metadata = {
  title: "FezLink",
  description: "Short you urls fast and easy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <Analytics />
      <SpeedInsights />
      <html lang="en">
        <body className={`${workSans.className} antialiased`}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
