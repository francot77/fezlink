import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard'])

// Lista de rutas que queremos bloquear
const blockedPaths = [
    '/wp-admin',
    '/wp-login.php',
    '/xmlrpc.php',
    '/wordpress',
    '/wordpress/wp-admin',
    '/wordpress/wp-admin/setup-config.php',
]

// Middleware principal
export default clerkMiddleware(async (auth, req) => {
    const { pathname } = req.nextUrl

    // Bloquear rutas maliciosas (WordPress scanners)
    if (blockedPaths.some((path) => pathname.startsWith(path))) {
        return new NextResponse('Forbidden', { status: 403 })
    }

    // Aplicar protección de Clerk sólo a rutas protegidas
    if (isProtectedRoute(req)) {
        await auth.protect()
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}
