import { Link } from '@/app/models/links';
import { LinkStats } from '../models/linkStats';
import Click from '../models/clicks'; // <-- importá tu modelo nuevo
import GlobalClicks from '../models/globalClicks';
import dbConnect from '@/lib/mongodb';
import { NextResponse } from 'next/server';

function getCountryCode(req: RequestWithHeaders): string {
    const country = req.headers.get('x-vercel-ip-country');
    return country || 'UNKNOWN';
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
    const sanitizedSlug = sanitize(slug!);
    if (sanitizedSlug?.startsWith("@")) return NextResponse.redirect(`${process.env.BASE_URL}/bio/${sanitizedSlug.substring(1)}`);

    const country = getCountryCode(req);
    if (!slug) return NextResponse.redirect(`${process.env.BASE_URL}/404`);

    await dbConnect();

    const link = await Link.findOne({ shortId: slug });
    if (!link) return NextResponse.redirect(`${process.env.BASE_URL}/404`);

    // Actualizar contador totalClicks
    const updatedLink = await Link.findOneAndUpdate(
        { _id: link._id },
        { $inc: { totalClicks: 1 } },
        { new: true }
    );

    if (!updatedLink) return NextResponse.redirect(`${process.env.BASE_URL}/404`);

    // Actualizar clicks por país en linkStats
    const res = await LinkStats.updateOne(
        { linkId: link._id, 'countries.country': country },
        { $inc: { 'countries.$.clicksCount': 1 } }
    );

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

    // Update global clicks counter
    try {
        await GlobalClicks.findOneAndUpdate({}, { $inc: { count: 1 } }, { upsert: true });
    } catch (error) {
        console.error('Error updating global clicks counter:', error);
    }

    // --- NUEVO: Registrar clic en colección clicks ---
    try {
        await Click.create({
            linkId: link._id,
            userId: link.userId,
            country,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error registrando clic en clicks:', error);
        // No interrumpir la redirección si falla la inserción
    }

    return NextResponse.redirect(updatedLink.originalUrl, 301);
}
