// app/api/links/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Link, type LinkDocument } from '@/app/models/links';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';

function isPremiumActive(sessionClaims: CustomJwtSessionClaims): boolean {

    const metadata = sessionClaims.metadata;
    if (!metadata || metadata.accountType !== 'premium') return false;
    const expirationDate = Number(metadata.expiresAt);
    return expirationDate > Date.now();
}

const isValidHttpUrl = (value: unknown): value is string => {
    if (typeof value !== 'string') return false;
    try {
        const parsed = new URL(value);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
}

const buildShortUrl = (slug: string, req: Request) => {
    return `${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || req.headers.get('origin') || ''}/${slug}`;
}

export async function POST(req: Request): Promise<NextResponse> {
    const { userId, sessionClaims } = await auth();

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await dbConnect();

        const links = await Link.find({ userId });
        if (links.length >= 2 && !isPremiumActive(sessionClaims as CustomJwtSessionClaims)) {
            return NextResponse.json({ error: "Limited Account" }, { status: 401 });
        }

        const { destinationUrl } = await req.json();
        if (!isValidHttpUrl(destinationUrl)) {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
        }

        const normalizedUrl = new URL(destinationUrl).toString();

        // Generate unique slug with retry in case of rare collisions
        let newLink: LinkDocument | null = null;
        for (let attempt = 0; attempt < 5; attempt++) {
            const slug = crypto.randomBytes(4).toString('hex');

            try {
                // Persist both the canonical field (`shortId`) and its alias (`slug`) to
                // satisfy existing unique indexes in the database.
                newLink = await Link.create({ destinationUrl: normalizedUrl, shortId: slug, slug, userId });
                break;
            } catch (error: unknown) {
                if (error instanceof Error && 'code' in error && (error as { code?: number }).code === 11000) {
                    // Collision on the unique slug/shortId index, retry with a new value
                    continue;
                }
                throw error;
            }
        }

        if (!newLink) {
            return NextResponse.json({ error: 'Failed to generate unique short link' }, { status: 500 });
        }

        return NextResponse.json({
            id: newLink._id.toString(),
            destinationUrl: newLink.destinationUrl,
            shortUrl: buildShortUrl(newLink.slug, req),
            slug: newLink.slug,
            clicks: newLink.totalClicks
        });
    } catch (error) {
        console.error('Error creating link', error);
        return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
    }
}

export async function GET() {
    const { userId } = await auth();

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await dbConnect();
        const links = await Link.find({ userId });
        const response = links.map(link => ({
            id: link._id,
            destinationUrl: link.destinationUrl,
            shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || ''}/${link.slug}`,
            slug: link.slug,
            clicks: link.totalClicks
        }));

        return NextResponse.json({ links: response });
    } catch (error) {
        console.error('Error fetching links', error);
        return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
    }
}
