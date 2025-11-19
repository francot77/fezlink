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
interface RequestWithHeaders extends Request {
    headers: Headers;
}

export async function GET(req: Request, context: { params: Promise<{ slug?: string }> }) {
    const { slug } = await context.params;
    if (!slug) return NextResponse.redirect(`${process.env.BASE_URL}/404`);

    const sanitizedSlug = sanitize(slug);

    if (!sanitizedSlug) return NextResponse.redirect(`${process.env.BASE_URL}/404`);
    if (sanitizedSlug.startsWith("@")) return NextResponse.redirect(`${process.env.BASE_URL}/bio/${sanitizedSlug.substring(1)}`);

    const country = getCountryCode(req);
    const userAgent = req.headers.get('user-agent');
    const deviceType = detectDeviceType(userAgent, req.headers);

    await dbConnect();

    const updatedLink = await Link.findOneAndUpdate(
        { shortId: sanitizedSlug },
        { $inc: { totalClicks: 1 } },
        { new: true }
    );

    if (!updatedLink) return NextResponse.redirect(`${process.env.BASE_URL}/404`);

    const linkId = updatedLink._id;

    const statsUpdate = LinkStats.updateOne(
        { linkId, 'countries.country': country },
        { $inc: { 'countries.$.clicksCount': 1 } }
    ).then(async (res) => {
        if (res.modifiedCount === 0) {
            await LinkStats.updateOne(
                { linkId },
                {
                    $setOnInsert: { linkId },
                    $push: { countries: { country, clicksCount: 1 } }
                },
                { upsert: true }
            );
        }
    });

    const globalUpdate = GlobalClicks.findOneAndUpdate({}, { $inc: { count: 1 } }, { upsert: true });

    const clickLog = Click.create({
        linkId,
        userId: updatedLink.userId,
        country,
        timestamp: new Date(),
        userAgent,
        deviceType,
    });

    await Promise.allSettled([statsUpdate, globalUpdate, clickLog]);

    const response = NextResponse.redirect(updatedLink.originalUrl, 301);
    response.headers.set('Cache-Control', 'public, max-age=604800, s-maxage=604800, stale-while-revalidate=3600');

    return response;
}
