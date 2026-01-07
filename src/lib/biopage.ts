import { cache } from 'react';
import dbConnect from '@/lib/mongodb';
import Biopage, { type IBiopage } from '@/app/models/bioPages';

export interface BioPageData {
  slug: string;
  links: { shortUrl: string; label: string }[];
  textColor: string;
  background?: {
    base: string;
    image?: {
      url: string;
      blur?: number;
      positionX?: number;
      positionY?: number;
      zoom?: number;
    };
  };
  avatarUrl: string;
  description?: string;
}

export const getBiopageBySlug = cache(async (slug: string): Promise<BioPageData | null> => {
  await dbConnect();

  const biopage = await Biopage.findOne({ slug }).lean<IBiopage>();
  if (!biopage) return null;

  const links =
    ((biopage.links || []) as unknown[]).map((link: unknown) => {
      const l = link as { shortUrl?: string; label?: string };
      return {
        shortUrl: l.shortUrl ?? '',
        label: l.label ?? '',
      };
    }) ?? [];

  return {
    slug: biopage.slug,
    links,
    textColor: biopage.textColor || '#ffffff',
    background: biopage.background || { base: '#000000' },
    avatarUrl: biopage.avatarUrl || '',
    description: biopage.description || undefined,
  };
});
