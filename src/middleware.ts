import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard'])
const isAdminRoute = createRouteMatcher(['/admin(.*)'])

// Lista de rutas que queremos bloquear
const blockedPaths = [
    '/wp-admin',
    '/wp-login.php',
    '/xmlrpc.php',
    '/wordpress',
    '/wordpress/wp-admin',
    '/wp-admin/setup-config.php',
    '/wordpress/wp-admin/setup-config.php',
]

// Middleware principal
export default clerkMiddleware(async (auth, req) => {
    const { pathname } = req.nextUrl

    //Check para admin cms
    if (isAdminRoute(req) && (await auth()).sessionClaims?.metadata?.role !== 'admin') {
        const url = new URL('/', req.url)
        return NextResponse.redirect(url)
    }
    //Block para bots
    if (blockedPaths.some((path) => pathname.startsWith(path))) {
        return new NextResponse('Forbidden', { status: 403 })
    }
    //Para protejer el dashboar sin auth
    if (isProtectedRoute(req)) {
        await auth.protect()
    }
    return NextResponse.next()
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}
