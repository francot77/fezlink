import { NextResponse } from 'next/server';
import { getAuth, isPremiumActive } from '@/core/auth';
import { buildShortUrl, createLinkForUser, listLinksForUser } from '@/core/links/service';

const isValidHttpUrl = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};


export async function POST(req: Request): Promise<NextResponse> {
  const { userId, session } = await getAuth();

  if (!userId || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const links = await listLinksForUser(userId);

    // Verificar límite de links para usuarios free
    if (links.length >= 2 && !isPremiumActive(session)) {
      return NextResponse.json(
        { error: 'Free users can only create 2 links. Upgrade to Premium for unlimited links.' },
        { status: 403 }
      );
    }

    const { destinationUrl } = await req.json();

    if (!isValidHttpUrl(destinationUrl)) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const newLink = await createLinkForUser(userId, destinationUrl);

    return NextResponse.json({
      id: newLink.id,
      destinationUrl: newLink.destinationUrl,
      shortUrl: buildShortUrl(newLink.slug, req.headers.get('origin') || undefined),
      slug: newLink.slug,
      clicks: newLink.clicks,
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
    const links = await listLinksForUser(userId);
    const response = links.map((link) => ({
      id: link.id,
      destinationUrl: link.destinationUrl,
      shortUrl: buildShortUrl(link.slug),
      slug: link.slug,
      clicks: link.clicks,
      byCountry: link.byCountry,
    }));

    return NextResponse.json({ links: response });
  } catch (error) {
    console.error('Error fetching links', error);
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
  }
}
