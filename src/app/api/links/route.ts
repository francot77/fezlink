import { NextRequest, NextResponse } from 'next/server';
import { getAuth, isPremiumActive } from '@/core/auth';
import { buildShortUrl, createLinkForUser, listLinksForUser } from '@/core/links/service';
import rateLimit from '@/lib/rate-limit';
import { createLinkSchema } from '@/core/utils/validation';
import { logger, SecurityEvents } from '@/lib/logger';
import { withErrorHandler, AppError } from '@/lib/error-handler';
import { getClientIp } from '@/lib/get-client-ip';

// Rate limiter: 10 links per minute per IP
const createLinkLimiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

async function createLinkHandler(req: NextRequest) {
  const { userId, session } = await getAuth();

  if (!userId || !session) {
    throw new AppError(401, 'Unauthorized');
  }

  // 1. Rate Limiting
  try {
    await createLinkLimiter.check(req, 10);
  } catch {
    logger.security(SecurityEvents.RATE_LIMIT_EXCEEDED, {
      userId,
      endpoint: '/api/links',
      ip: getClientIp(req),
    });
    throw new AppError(429, 'Rate limit exceeded. Please try again later.');
  }

  // 2. Parse body
  let body;
  try {
    body = await req.json();
  } catch {
    throw new AppError(400, 'Invalid JSON body');
  }

  let { destinationUrl } = body;

  // 3. Pre-process: Add protocol if missing
  if (destinationUrl && typeof destinationUrl === 'string' && !/^https?:\/\//i.test(destinationUrl)) {
    destinationUrl = 'https://' + destinationUrl;
  }

  // 4. Validate with Zod
  const validation = createLinkSchema.safeParse({ destinationUrl });

  if (!validation.success) {
    // Return first error message
    const errorMessage = validation.error.issues[0]?.message || 'Invalid URL';
    throw new AppError(400, errorMessage);
  }

  const validUrl = validation.data.destinationUrl;

  // 5. Check Free Plan Limits
  const links = await listLinksForUser(userId);

  if (links.length >= 2 && !isPremiumActive(session)) {
    throw new AppError(403, 'Free users can only create 2 links. Upgrade to Premium for unlimited links.');
  }

  // 6. Create Link
  const newLink = await createLinkForUser(userId, validUrl);

  logger.info('Link created successfully', {
    userId,
    linkId: newLink.id,
    destinationUrl: validUrl
  });

  return NextResponse.json({
    id: newLink.id,
    destinationUrl: newLink.destinationUrl,
    shortUrl: buildShortUrl(newLink.slug, req.headers.get('origin') || undefined),
    slug: newLink.slug,
    clicks: newLink.clicks,
  });
}

async function getLinksHandler() {
  const { userId } = await getAuth();

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

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
}

export const POST = withErrorHandler(createLinkHandler);
export const GET = withErrorHandler(getLinksHandler);
