import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard'])
const isAdminRoute = createRouteMatcher(['/admin(.*)'])

const blockedPaths = [
    '/wp-admin',
    '/wp-login.php',
    '/xmlrpc.php',
    '/wordpress',
    '/wordpress/wp-admin',
    '/wp-admin/setup-config.php',
    '/wordpress/wp-admin/setup-config.php',
]


const ALLOWED_BOTS = [
    "facebookexternalhit",
    "WhatsApp",
    "TelegramBot",
    "Twitterbot",
    "LinkedInBot",
    "Discordbot",
    "Googlebot",
]

export default clerkMiddleware(async (auth, req) => {
    const { pathname } = req.nextUrl
    const ua = req.headers.get("user-agent") || ""

    // 👇 1) Permitir crawlers confiables SIN restricciones
    for (const bot of ALLOWED_BOTS) {
        if (ua.includes(bot)) {
            return NextResponse.next()
        }
    }
    if (pathname.startsWith("/bio")) {
        const res = NextResponse.next()
        res.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400")
        res.headers.delete("X-Clerk-Auth-Reason")
        res.headers.delete("X-Clerk-Auth-Status")
        return res
    }


    // 2) Bloqueos falsos positivos estilo WordPress
    if (blockedPaths.some((path) => pathname.startsWith(path))) {
        return new NextResponse('Forbidden', { status: 403 })
    }

    // 3) Admin para Fezlink
    if (isAdminRoute(req) && (await auth()).sessionClaims?.metadata?.role !== 'admin') {
        const url = new URL('/', req.url)
        return NextResponse.redirect(url)
    }

    // 4) Dashboard requiere login
    if (isProtectedRoute(req)) {
        await auth.protect()
    }

    return NextResponse.next()
})

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
}
