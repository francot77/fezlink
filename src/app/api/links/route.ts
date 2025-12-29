import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Link } from '@/app/models/links';
import { getAuth, isPremiumActive } from '@/lib/auth-helpers';
import crypto from 'crypto';

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
    const { userId, session } = await getAuth();

    if (!userId || !session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();

        const links = await Link.find({ userId });

        // Verificar límite de links para usuarios free
        if (links.length >= 2 && !isPremiumActive(session)) {
            return NextResponse.json({ error: 'Free users can only create 2 links. Upgrade to Premium for unlimited links.' }, { status: 403 });
        }

        const { destinationUrl } = await req.json();

        if (!isValidHttpUrl(destinationUrl)) {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
        }

        const normalizedUrl = new URL(destinationUrl).toString();

        // Generate unique slug
        let slug: string;
        let existingLink;
        do {
            slug = crypto.randomBytes(4).toString('hex');
            existingLink = await Link.findOne({ slug });
        } while (existingLink);

        const newLink = await Link.create({
            destinationUrl: normalizedUrl,
            slug,
            userId
        });

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
    const { userId } = await getAuth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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