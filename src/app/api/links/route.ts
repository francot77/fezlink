// app/api/links/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Link } from '@/app/models/links';
import { auth } from '@clerk/nextjs/server';

interface PostRequestBody {
    originalUrl: string;
}

function isPremiumActive(sessionClaims: CustomJwtSessionClaims): boolean {

    const metadata = sessionClaims.metadata;
    if (!metadata || metadata.accountType !== 'premium') return false;
    const expirationDate = Number(metadata.expiresAt);
    return expirationDate > Date.now();
}

export async function POST(req: Request): Promise<NextResponse> {
    const { userId, sessionClaims } = await auth()
    await dbConnect();

    const links = await Link.find({ userId })
    if (links.length >= 2 && !isPremiumActive(sessionClaims as CustomJwtSessionClaims)) {
        return NextResponse.json({ error: "Limited Account" }, { status: 401 });
    }
    const { originalUrl }: PostRequestBody = await req.json();

    // Generate unique shortId
    let shortId: string;
    let existingLink;
    do {
        shortId = Math.random().toString(36).substring(2, 8);
        existingLink = await Link.findOne({ shortId });
    } while (existingLink);

    const newLink = await Link.create({ originalUrl, shortId, userId });

    return NextResponse.json({
        id: newLink._id.toString(),
        originalUrl: newLink.originalUrl,
        shortUrl: `${process.env.BASE_URL}/${newLink.shortId}`,
        clicks: newLink.totalClicks
    });
}

export async function GET() {
    const { userId } = await auth()
    await dbConnect();
    const links = await Link.find({ userId });
    const response = links.map(link => ({
        id: link._id,
        originalUrl: link.originalUrl,
        shortUrl: `${process.env.BASE_URL}/${link.shortId}`,
        shortId: link.shortId,
        clicks: link.totalClicks
    }));

    return NextResponse.json({ links: response });

}
