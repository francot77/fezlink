import { Link } from '@/app/models/links';
import { LinkStats } from '../models/linkStats';
import dbConnect from '@/lib/mongodb';
import { NextResponse } from 'next/server';

interface RequestWithHeaders extends Request {
    headers: Headers;
}

function getCountryCode(req: RequestWithHeaders): string {
    const country = req.headers.get('x-vercel-ip-country');
    return country || 'UNKNOWN';
}
function sanitize(slug: string) {
    if (slug.startsWith("@")) return "@" + slug.replace(/[^\w-]/g, '')
    return slug.replace(/[^\w-]/g, '')
}
export async function GET(req: Request, context: { params: Promise<{ slug?: string }> }) {
    const { slug } = await context.params;
    const sanitizedSlug = sanitize(slug!)
    if (sanitizedSlug?.startsWith("@")) return NextResponse.redirect(`${process.env.BASE_URL}/bio/${sanitizedSlug.substring(1)}`)
    const country = getCountryCode(req);

    if (!slug) return NextResponse.redirect(`${process.env.BASE_URL}/404`);

    await dbConnect();

    const link = await Link.findOne({ shortId: slug });
    if (!link) return NextResponse.redirect(`${process.env.BASE_URL}/404`);

    const updatedLink = await Link.findOneAndUpdate(
        { _id: link._id },
        { $inc: { totalClicks: 1 } },
        { new: true }
    );

    if (!updatedLink) return NextResponse.redirect(`${process.env.BASE_URL}/404`);

    // Paso 1: Intentar incrementar el país si ya existe en el array
    const res = await LinkStats.updateOne(
        { linkId: link._id, 'countries.country': country },
        { $inc: { 'countries.$.clicksCount': 1 } }
    );

    // Paso 2: Si no existía, pushear uno nuevo
    if (res.modifiedCount === 0) {
        await LinkStats.updateOne(
            { linkId: link._id },
            {
                $setOnInsert: { linkId: link._id },
                $push: { countries: { country, clicksCount: 1 } }
            },
            { upsert: true }
        );
    }

    return NextResponse.redirect(updatedLink.originalUrl, 301);
}
