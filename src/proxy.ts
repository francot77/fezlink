import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { detectSource } from '@/lib/attribution';

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const response = NextResponse.next();

  // 1. Dashboard Logic (Auth Check / Logging)
  if (path.startsWith('/dashboard')) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    console.log('[MIDDLEWARE]', {
      path,
      hasToken: !!token,
    });
    
    // Note: The original proxy implementation didn't block access, just logged.
    // If you want to block unauthorized access, uncomment the lines below:
    /*
    if (!token) {
       const url = req.nextUrl.clone();
       url.pathname = '/login';
       return NextResponse.redirect(url);
    }
    */
  }

  // 2. Biopage Logic (Attribution)
  if (path.startsWith('/bio/')) {
    // Check if attribution cookie exists
    if (!req.cookies.has('biopage_source')) {
       const source = detectSource(req);
       
       // Set cookie for persistence (30 days)
       response.cookies.set('biopage_source', source, { 
           path: '/', 
           httpOnly: false, // Allow client-side access
           maxAge: 60 * 60 * 24 * 30, // 30 days
           sameSite: 'lax'
       });
       
       // Add header for immediate server-side access
       response.headers.set('x-biopage-source', source);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/bio/:path*'
  ],
};
