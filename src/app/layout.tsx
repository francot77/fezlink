import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import "./globals.css";
import {
  ClerkProvider
} from "@clerk/nextjs";
const workSans = Work_Sans({
  variable: "--font-worksans",
  subsets: ["latin"],
  weight: ["300", "500"]
});



const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "https://www.fezlink.com";
const metadataBase = (() => {
  try {
    return new URL(siteUrl);
  } catch {
    return new URL("https://www.fezlink.com");
  }
})();

const title = "FezLink | Shorten, share, and measure links";
const description = "Create short links, QR codes, and bio pages with analytics built in.";
const previewImage = "/hero.webp";

export const metadata: Metadata = {
  metadataBase,
  title,
  description,
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "FezLink",
    images: [
      {
        url: previewImage,
        width: 1200,
        height: 630,
        alt: "FezLink dashboard preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [previewImage],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="manifest" href="/manifest.json" />
        </head>
        <body className={`${workSans.className} antialiased`}>
          {children}
          <Analytics />
          <SpeedInsights />
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
