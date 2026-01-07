import { NextResponse } from 'next/server';
import { ClickEvent, DeviceType, emitAnalyticsEvent } from '@/lib/emitAnalyticsEvent';
import { Link } from '@/app/models/links';
import dbConnect from '@/lib/mongodb';

export function getCountryCode(req: Request): string {
  const headers = (req as any).headers as Headers;
  return headers.get('x-vercel-ip-country') || 'UNKNOWN';
}

export function detectDeviceType(userAgent: string | null, headers: Headers): DeviceType {
  const hintedType = headers.get('x-device-type')?.toLowerCase();
  if (hintedType === 'mobile' || hintedType === 'tablet' || hintedType === 'desktop') {
    return hintedType as DeviceType;
  }
  const chUaMobile = headers.get('sec-ch-ua-mobile');
  if (chUaMobile === '?1') return 'mobile';
  if (chUaMobile === '?0') return 'desktop';
  if (!userAgent) return 'unknown';
  const ua = userAgent.toLowerCase();
  if (/(ipad|tablet|android(?!.*mobile))/i.test(ua)) return 'tablet';
  if (/(mobile|iphone|android)/i.test(ua)) return 'mobile';
  return 'desktop';
}

export function detectSource(searchParams: URLSearchParams, referer: string | null, userAgent: string | null): string {
  const explicitSrc = searchParams.get('src') || searchParams.get('source') || searchParams.get('utm_source');
  if (explicitSrc) return explicitSrc.toLowerCase().replace(/[^\w-]/g, '_');
  if (referer) {
    const refLower = referer.toLowerCase();
    if (refLower.includes('instagram.com') || refLower.includes('l.instagram.com')) return 'instagram_bio';
    if (refLower.includes('whatsapp.com') || refLower.includes('wa.me')) return 'whatsapp';
    if (refLower.includes('facebook.com') || refLower.includes('fb.com') || refLower.includes('m.facebook.com')) return 'facebook';
    if (refLower.includes('twitter.com') || refLower.includes('t.co') || refLower.includes('x.com')) return 'twitter';
    if (refLower.includes('linkedin.com') || refLower.includes('lnkd.in')) return 'linkedin';
    if (refLower.includes('tiktok.com')) return 'tiktok';
    if (refLower.includes('youtube.com') || refLower.includes('youtu.be')) return 'youtube';
    if (refLower.includes('telegram.org') || refLower.includes('t.me')) return 'telegram';
    try {
      const refUrl = new URL(referer);
      if (refUrl.hostname !== new URL(process.env.BASE_URL || '').hostname) return 'referral';
    } catch {}
  }
  if (userAgent) {
    const uaLower = userAgent.toLowerCase();
    if (uaLower.includes('qr') || uaLower.includes('scanner')) return 'qr_scan';
  }
  return 'direct';
}

export function sanitizeSlug(slug: string) {
  if (slug.startsWith('@')) return '@' + slug.replace(/[^\w-]/g, '');
  return slug.replace(/[^\w-]/g, '');
}

export function cacheableRedirect(url: string, status = 301) {
  const res = NextResponse.redirect(url, status);
  return res;
}

export async function resolveAndRedirect(req: Request, slug: string) {
  const sanitizedSlug = sanitizeSlug(slug);
  if (!sanitizedSlug) return cacheableRedirect(`${process.env.BASE_URL}/404`);
  if (sanitizedSlug.startsWith('@')) return cacheableRedirect(`${process.env.BASE_URL}/bio/${sanitizedSlug.slice(1)}`);
  const { searchParams } = new URL(req.url);
  const referer = req.headers.get('referer') || req.headers.get('referrer');
  const userAgent = req.headers.get('user-agent');
  const source = detectSource(searchParams, referer, userAgent);
  const country = getCountryCode(req);
  const deviceType = detectDeviceType(userAgent, req.headers);
  await dbConnect();
  const link = await Link.findOne({ slug: sanitizedSlug });
  if (!link) return cacheableRedirect(`${process.env.BASE_URL}/404`);
  const clickEvent: ClickEvent = {
    type: 'click',
    linkId: link._id.toString(),
    userId: link.userId.toString(),
    country,
    source,
    deviceType,
    userAgent: userAgent ?? undefined,
    timestamp: new Date(),
  };
  emitAnalyticsEvent(clickEvent);
  return cacheableRedirect(link.destinationUrl, 301);
}

