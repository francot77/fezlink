import dbConnect from '@/lib/mongodb';
import { Link } from '@/app/models/links';
import Biopage from '@/app/models/bioPages';

export function buildShortUrl(slug: string, origin?: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || origin || '';
  return `${base}/${slug}`;
}

export async function listLinksForUser(userId: string) {
  await dbConnect();
  const links = await Link.find({ userId });
  return links.map((link) => ({
    id: link._id.toString(),
    destinationUrl: link.destinationUrl,
    slug: link.slug,
    clicks: link.totalClicks,
    byCountry: link.byCountry,
  }));
}

export async function createLinkForUser(userId: string, destinationUrl: string) {
  await dbConnect();
  const normalizedUrl = new URL(destinationUrl).toString();
  let slug: string;
  let existingLink;
  const crypto = await import('crypto');
  do {
    slug = crypto.randomBytes(4).toString('hex');
    existingLink = await Link.findOne({ slug });
  } while (existingLink);
  const newLink = await Link.create({
    destinationUrl: normalizedUrl,
    slug,
    userId,
  });
  return {
    id: newLink._id.toString(),
    destinationUrl: newLink.destinationUrl,
    slug: newLink.slug,
    clicks: newLink.totalClicks,
  };
}

export async function deleteLinkForUser(userId: string, id: string) {
  await dbConnect();
  const link = await Link.findById(id);
  if (!link) return { ok: false, reason: 'not_found' };
  if (link.userId !== userId) return { ok: false, reason: 'unauthorized' };
  await Biopage.findOneAndUpdate({ userId: link.userId }, { $pull: { links: { shortId: link.slug } } });
  await Link.findByIdAndDelete(id);
  return { ok: true };
}

export async function getLinkStatsForUser(userId: string, linkId: string) {
  await dbConnect();
  const { LinkStats } = await import('@/app/models/linkStats');
  const link = await Link.findOne({ _id: linkId, userId });
  if (!link) return { ok: false, reason: 'forbidden' as const };
  const stats = await LinkStats.find({ linkId });
  if (stats.length > 0) return { ok: true, stats: stats[0] };
  return { ok: false, reason: 'no_info' as const };
}

