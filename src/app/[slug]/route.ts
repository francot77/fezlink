import { Link } from '@/app/models/links';
import { LinkStats } from '../models/linkStats';
import Click from '../models/clicks'; // <-- importá tu modelo nuevo
import GlobalClicks from '../models/globalClicks';
import dbConnect from '@/lib/mongodb';
import { NextResponse } from 'next/server';

type DeviceType = 'mobile' | 'desktop' | 'tablet' | 'unknown';

function getCountryCode(req: RequestWithHeaders): string {
    const country = req.headers.get('x-vercel-ip-country');
    return country || 'UNKNOWN';
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
    const isTablet = /(ipad|tablet|playbook|silk|kindle|sm\-t|tab\s+\d|android(?!.*mobile))/i.test(ua);
    if (isTablet) return 'tablet';

    const isMobile = /(mobile|iphone|ipod|blackberry|iemobile|opera mini|fennec|windows phone|webos|palm|bada|series60|symbian|nokia|android)/i.test(ua);
    if (isMobile) return 'mobile';

    return 'desktop';
}

function sanitize(slug: string) {
    if (slug.startsWith("@")) return "@" + slug.replace(/[^\w-]/g, '')
    return slug.replace(/[^\w-]/g, '')
}

function cacheableRedirect(url: string, status = 301) {
    const response = NextResponse.redirect(url, status);
    response.headers.set('Cache-Control', 'public, max-age=3600');
    return response;
}
interface RequestWithHeaders extends Request {
    headers: Headers;
}

export async function GET(req: Request, context: { params: Promise<{ slug?: string }> }) {
    const { slug } = await context.params;
    const sanitizedSlug = slug ? sanitize(slug) : '';

    if (!sanitizedSlug) return cacheableRedirect(`${process.env.BASE_URL}/404`);
    if (sanitizedSlug.startsWith("@")) return cacheableRedirect(`${process.env.BASE_URL}/bio/${sanitizedSlug.substring(1)}`);

    const country = getCountryCode(req);
    const userAgent = req.headers.get('user-agent');
    const deviceType = detectDeviceType(userAgent, req.headers);
    const referrer = req.headers.get('referer') || req.headers.get('referrer');

    await dbConnect();

    const updatedLink = await Link.findOneAndUpdate(
        { shortId: sanitizedSlug },
        { $inc: { totalClicks: 1 } },
        { new: true }
    );

    if (!updatedLink) return cacheableRedirect(`${process.env.BASE_URL}/404`);

    const source = updatedLink.source?.trim() || 'default';

    const linkStatsPromise = (async () => {
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
                        $push: { countries: { country, clicksCount: 1 } }
                    },
                    { upsert: true }
                );
            }

            const sourceUpdate = await LinkStats.updateOne(
                { linkId: updatedLink._id, 'sources.source': source },
                { $inc: { 'sources.$.clicksCount': 1 } }
            );

            if (sourceUpdate.modifiedCount === 0) {
                await LinkStats.updateOne(
                    { linkId: updatedLink._id },
                    {
                        $setOnInsert: { linkId: updatedLink._id },
                        $push: { sources: { source, clicksCount: 1 } }
                    },
                    { upsert: true }
                );
            }
        } catch (error) {
            console.error('Error updating link stats:', error);
        }
    })();

    const globalClicksPromise = GlobalClicks.findOneAndUpdate({}, { $inc: { count: 1 } }, { upsert: true }).catch((error) => {
        console.error('Error updating global clicks counter:', error);
    });

    const clickLogPromise = Click.create({
        linkId: updatedLink._id,
        userId: updatedLink.userId,
        country,
        timestamp: new Date(),
        userAgent,
        deviceType,
        source,
        referrer
    }).catch((error) => {
        console.error('Error registrando clic en clicks:', error);
        // No interrumpir la redirección si falla la inserción
    });

    await Promise.all([linkStatsPromise, globalClicksPromise, clickLogPromise]);

    return cacheableRedirect(updatedLink.originalUrl, 301);
}
