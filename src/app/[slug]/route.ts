import { Link } from '@/app/models/links';
import { LinkStats } from '../models/linkStats';
import Click from '../models/clicks';
import GlobalClicks from '../models/globalClicks';
import dbConnect from '@/lib/mongodb';
import { NextResponse } from 'next/server';

type DeviceType = 'mobile' | 'desktop' | 'tablet' | 'unknown';

interface RequestWithHeaders extends Request {
    headers: Headers;
}

function getCountryCode(req: RequestWithHeaders): string {
    return req.headers.get('x-vercel-ip-country') || 'UNKNOWN';
}

function detectDeviceType(userAgent: string | null, headers: Headers): DeviceType {
    const hintedType = headers.get('x-device-type')?.toLowerCase();
    if (hintedType === 'mobile' || hintedType === 'tablet' || hintedType === 'desktop') {
        return hintedType;
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

function sanitize(slug: string) {
    if (slug.startsWith('@')) return '@' + slug.replace(/[^\w-]/g, '');
    return slug.replace(/[^\w-]/g, '');
}

function cacheableRedirect(url: string, status = 301) {
    const res = NextResponse.redirect(url, status);
    res.headers.set('Cache-Control', 'public, max-age=3600');
    return res;
}

export async function GET(req: Request, context: { params: Promise<{ slug?: string }> }) {
    const { slug } = await context.params;
    const sanitizedSlug = slug ? sanitize(slug) : '';

    if (!sanitizedSlug) return cacheableRedirect(`${process.env.BASE_URL}/404`);
    if (sanitizedSlug.startsWith('@')) {
        return cacheableRedirect(`${process.env.BASE_URL}/bio/${sanitizedSlug.slice(1)}`);
    }

    const { searchParams } = new URL(req.url);
    const src = searchParams.get('src') ?? 'default';

    const country = getCountryCode(req as RequestWithHeaders);
    const userAgent = req.headers.get('user-agent');
    const deviceType = detectDeviceType(userAgent, req.headers);

    await dbConnect();

    const updatedLink = await Link.findOneAndUpdate(
        { slug: sanitizedSlug },
        { $inc: { totalClicks: 1 } },
        { new: true }
    );

    if (!updatedLink) return cacheableRedirect(`${process.env.BASE_URL}/404`);

    // ⬇⬇⬇ MÉTRICAS DESACOPLADAS ⬇⬇⬇
    const metricsTask = async () => {
        try {
            const res = await LinkStats.updateOne(
                { linkId: updatedLink._id, 'countries.country': country },
                { $inc: { 'countries.$.clicksCount': 1 } }
            );

            if (res.modifiedCount === 0) {
                await LinkStats.updateOne(
                    { linkId: updatedLink._id },
                    {
                        $setOnInsert: { linkId: updatedLink._id },
                        $push: { countries: { country, clicksCount: 1 } },
                    },
                    { upsert: true }
                );
            }

            await GlobalClicks.findOneAndUpdate(
                {},
                { $inc: { count: 1 } },
                { upsert: true }
            );

            await Click.create({
                linkId: updatedLink._id,
                userId: updatedLink.userId,
                country,
                timestamp: new Date(),
                userAgent,
                deviceType,
                source: src,
            });
        } catch (err) {
            console.error('Metrics error:', err);
        }
    };

    // Node runtime (Vercel)
    if ('waitUntil' in globalThis) {
        // @ts-expect-error asd
        globalThis.waitUntil(metricsTask());
    } else {
        metricsTask(); // fallback local
    }

    return cacheableRedirect(updatedLink.destinationUrl, 301);
}
