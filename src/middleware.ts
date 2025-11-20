// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

const ALLOWED_BOTS = [
  "Discord",
  "Discordbot",
  "facebookexternalhit",
  "WhatsApp",
  "TelegramBot",
  "Twitterbot",
  "LinkedInBot",
  "Googlebot",
];

const BLOCKED_PATHS = [
  '/wp-admin',
  '/wp-login.php',
  '/xmlrpc.php',
  '/wordpress',
];

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const ua = req.headers.get("user-agent") || "";

  // 1) Bloquear basura tipo /wp-XXX lo antes posible
  if (BLOCKED_PATHS.some((path) => pathname.startsWith(path))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 2) Rutas que querés TOTALMENTE públicas: bio y shortlinks
  if (pathname.startsWith("/bio") || pathname.startsWith("/l/")) {
    const res = NextResponse.next();

    res.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, max-age=3600, stale-while-revalidate=86400"
    );

    // borrar metadata de Clerk por prolijidad
    res.headers.delete("X-Clerk-Auth-Reason");
    res.headers.delete("X-Clerk-Auth-Status");
    res.headers.delete("Set-Cookie");

    return res;
  }

  // 3) Bots buenos → dejan pasar y cachean (en TODO lo demás)
  if (ALLOWED_BOTS.some(bot => ua.includes(bot))) {
    const res = NextResponse.next();
    res.headers.set(
      "Cache-Control",
      "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
    );
    return res;
  }

  // 4) Admin: chequeo de rol
  if (isAdminRoute(req)) {
    const session = await auth();
    if (session.sessionClaims?.metadata?.role !== 'admin') {
      const url = new URL('/', req.url);
      return NextResponse.redirect(url);
    }
  }

  // 5) Dashboard protegido
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // 6) resto normal
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
