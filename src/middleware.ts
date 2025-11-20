import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

// Bots que deben poder ver OG metadata sin challenge ni headers privados
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

export default clerkMiddleware(async (auth, req) => {
    const { pathname } = req.nextUrl;
    const ua = req.headers.get("user-agent") || "";

    // 🟢 Si es un bot permitido → siempre dejamos pasar sin Clerk ni headers privados
    if (ALLOWED_BOTS.some(bot => ua.includes(bot))) {
        const res = NextResponse.next();
        res.headers.set(
            "Cache-Control",
            "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
        );
        return res;
    }

    // 🔴 Bloquear rutas basura de bots
    const blockedPaths = [
        '/wp-admin',
        '/wp-login.php',
        '/xmlrpc.php',
        '/wordpress',
    ];
    if (blockedPaths.some((path) => pathname.startsWith(path))) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    // 🟠 Check para admin CMS
    if (isAdminRoute(req) && (await auth()).sessionClaims?.metadata?.role !== 'admin') {
        const url = new URL('/', req.url);
        return NextResponse.redirect(url);
    }

    // 🔐 Proteger dashboard
    if (isProtectedRoute(req)) {
        await auth.protect();
    }

    // 🟦 Hacer públicas las biopages & shortlinks
    if (pathname.startsWith("/bio") || pathname.startsWith("/l/")) {
        const res = NextResponse.next();
        res.headers.set(
            "Cache-Control",
            "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
        );
        return res;
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};
