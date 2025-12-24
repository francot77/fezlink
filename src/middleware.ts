import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

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

const clerk = clerkMiddleware(async (auth, req) => {
    const { pathname } = req.nextUrl;
    const ua = req.headers.get("user-agent") || "";

    if (ALLOWED_BOTS.some(bot => ua.includes(bot))) {
        const res = NextResponse.next();
        res.headers.set(
            "Cache-Control",
            "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
        );
        return res;
    }

    const blockedPaths = [
        '/wp-admin',
        '/wp-login.php',
        '/xmlrpc.php',
        '/wordpress',
    ];
    if (blockedPaths.some((path) => pathname.startsWith(path))) {
        return new NextResponse('Forbidden', { status: 403 });
    }


    if (isAdminRoute(req) && (await auth()).sessionClaims?.metadata?.role !== 'admin') {
        const url = new URL('/', req.url);
        return NextResponse.redirect(url);
    }


    if (isProtectedRoute(req)) {
        await auth.protect();
    }


    if (pathname.startsWith("/bio") || pathname.startsWith("/l/")) {
        const url = req.nextUrl.clone();
        const res = NextResponse.rewrite(url);

        res.headers.set(
            "Cache-Control",
            "public, s-maxage=3600, max-age=3600, stale-while-revalidate=86400"
        );

        res.headers.delete("X-Clerk-Auth-Reason");
        res.headers.delete("X-Clerk-Auth-Status");
        res.headers.delete("Set-Cookie"); // ⚠ evita sesión fantasma
        return res;
    }


    return NextResponse.next();
});

export default function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 🟢 EARLY EXIT: redirect biopages
    if (pathname.startsWith('/@')) {
        const slug = pathname.slice(2);
        return NextResponse.redirect(
            new URL(`/bio/${slug}`, req.url),
            308
        );
    }

    // 🔵 Todo lo demás pasa por Clerk
    return clerk(req, {} as NextFetchEvent);
}
export const config = {
    matcher: [
        // Todas las rutas excepto archivos estáticos y Next internals
        "/((?!_next|.*\\..*).*)",
        // APIs
        "/(api|trpc)(.*)",
    ],
};