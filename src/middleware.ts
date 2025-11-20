// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

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
  "/wp-admin",
  "/wp-login.php",
  "/xmlrpc.php",
  "/wordpress",
];

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const ua = req.headers.get("user-agent") || "";

  // 1) Bloquear rutas basura (solo se aplica en rutas que matchea el matcher)
  if (BLOCKED_PATHS.some((path) => pathname.startsWith(path))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2) Bots buenos (de nuevo, solo importa en dashboard/admin/apis protegidas)
  if (ALLOWED_BOTS.some((bot) => ua.includes(bot))) {
    const res = NextResponse.next();
    res.headers.set(
      "Cache-Control",
      "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
    );
    return res;
  }

  // 3) Rutas de admin
  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role !== "admin") {
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }
  }

  // 4) Dashboard protegido
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // 5) Resto (dentro del matcher) pasa normal
  return NextResponse.next();
});

// 🔑 ACÁ está la diferencia real
export const config = {
  matcher: [
    "/dashboard(.*)",
    "/admin(.*)",
  ],
};
