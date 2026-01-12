import { NextResponse } from 'next/server';
import { ClickEvent, DeviceType, emitAnalyticsEvent } from '@/lib/emitAnalyticsEvent';
import { Link } from '@/app/models/links';
import dbConnect from '@/lib/mongodb';
import { detectSource } from '@/lib/attribution';

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
  
  const source = detectSource(req);
  if (sanitizedSlug.startsWith('@')) return cacheableRedirect(`${process.env.BASE_URL}/bio/${sanitizedSlug.slice(1)}?source=${source}`);
  
  const userAgent = req.headers.get('user-agent');
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

