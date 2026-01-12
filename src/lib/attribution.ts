import { NextRequest } from 'next/server';

/**
 * Normalizes the source to a standard set of values.
 */
export function normalizeSource(source: string): string {
  return source.toLowerCase().replace(/[^\w-]/g, '_');
}

/**
 * Detects the source of the traffic based on request data.
 * Priority: Query Param > Referer > User Agent > Direct
 */
export function detectSource(req: NextRequest | Request): string {
  // Handle NextRequest and standard Request
  let searchParams: URLSearchParams;
  let referer: string | null;
  let userAgent: string | null;

  if ('nextUrl' in req) {
    searchParams = req.nextUrl.searchParams;
    referer = req.headers.get('referer') || req.headers.get('referrer');
    userAgent = req.headers.get('user-agent');
  } else {
    // Standard Request (used in resolver.ts)
    const url = new URL(req.url);
    searchParams = url.searchParams;
    referer = req.headers.get('referer') || req.headers.get('referrer');
    userAgent = req.headers.get('user-agent');
  }

  // 1. Explicit Source (Query Param)
  const explicitSrc = searchParams.get('src') || searchParams.get('source') || searchParams.get('utm_source');
  if (explicitSrc) return normalizeSource(explicitSrc);

  // 2. Referer
  if (referer) {
    const refLower = referer.toLowerCase();
    if (refLower.includes('instagram.com') || refLower.includes('l.instagram.com')) return 'instagram';
    if (refLower.includes('whatsapp.com') || refLower.includes('wa.me')) return 'whatsapp';
    if (refLower.includes('facebook.com') || refLower.includes('fb.com') || refLower.includes('m.facebook.com')) return 'facebook';
    if (refLower.includes('twitter.com') || refLower.includes('t.co') || refLower.includes('x.com')) return 'twitter';
    if (refLower.includes('linkedin.com') || refLower.includes('lnkd.in')) return 'linkedin';
    if (refLower.includes('tiktok.com')) return 'tiktok';
    if (refLower.includes('youtube.com') || refLower.includes('youtu.be')) return 'youtube';
    if (refLower.includes('telegram.org') || refLower.includes('t.me')) return 'telegram';
    if (refLower.includes('pinterest.com') || refLower.includes('pin.it')) return 'pinterest';
    if (refLower.includes('snapchat.com')) return 'snapchat';
    if (refLower.includes('reddit.com')) return 'reddit';
    
    // Check if referral (different host)
    try {
        // We need the current host to compare. 
        // In Middleware/NextRequest, we can get it from nextUrl.
        // In standard Request, we might need env or derive from url.
        let currentHost = '';
        if ('nextUrl' in req) {
            currentHost = req.nextUrl.hostname;
        } else {
             currentHost = new URL(req.url).hostname;
        }
        
        const refUrl = new URL(referer);
        if (refUrl.hostname !== currentHost) return 'referral';
    } catch {}
  }

  // 3. User Agent (QR Codes)
  if (userAgent) {
    const uaLower = userAgent.toLowerCase();
    if (uaLower.includes('qr') || uaLower.includes('scanner')) return 'qr_scan';
  }

  // 4. Fallback
  return 'direct';
}
