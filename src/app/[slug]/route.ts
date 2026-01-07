import { NextResponse } from 'next/server';
import { detectDeviceType, detectSource, getCountryCode, cacheableRedirect } from '@/core/redirects/resolver';
import { Link } from '@/app/models/links';
import dbConnect from '@/lib/mongodb';
import { ClickEvent, emitAnalyticsEvent } from '@/core/analytics/emitter';

function sanitize(slug: string) {
  if (slug.startsWith('@')) return '@' + slug.replace(/[^\w-]/g, '');
  return slug.replace(/[^\w-]/g, '');
}

export async function GET(req: Request, context: { params: Promise<{ slug?: string }> }) {
  const { slug } = await context.params;
  const sanitizedSlug = slug ? sanitize(slug) : '';

  if (!sanitizedSlug) return cacheableRedirect(`${process.env.BASE_URL}/404`);
  if (sanitizedSlug.startsWith('@')) {
    return cacheableRedirect(`${process.env.BASE_URL}/bio/${sanitizedSlug.slice(1)}`);
  }

  const { searchParams } = new URL(req.url);
  const referer = req.headers.get('referer') || req.headers.get('referrer');
  const userAgent = req.headers.get('user-agent');

  // ✅ DETECTAR SOURCE INTELIGENTEMENTE
  const source = detectSource(searchParams, referer, userAgent);

  const country = getCountryCode(req as any);
  const deviceType = detectDeviceType(userAgent, req.headers);

  await dbConnect();

  const link = await Link.findOne({ slug: sanitizedSlug });
  if (!link) return cacheableRedirect(`${process.env.BASE_URL}/404`);

  // 🔥 EMITIR EVENTO (única responsabilidad nueva)
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

  // fire-and-forget
  /* if ('waitUntil' in globalThis) {
        // @ts-expect-error Event Emitter error
        globalThis.waitUntil(emitAnalyticsEvent(clickEvent));
    } else {
        emitAnalyticsEvent(clickEvent);
    } */

  return cacheableRedirect(link.destinationUrl, 301);
}
