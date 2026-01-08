import { cache } from 'react';
import dbConnect from '@/lib/mongodb';
import Biopage, { type IBiopage } from '@/app/models/bioPages';
import { Link } from '@/app/models/links';

export interface BioPageData {
  slug: string;
  links: {
    shortUrl: string;
    label: string;
    destinationUrl: string;
    linkId: string;
  }[];
  userId: string;
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

  // Case-insensitive search to support legacy mixed-case slugs and new lowercase ones
  const biopage = await Biopage.findOne({
    slug: { $regex: new RegExp(`^${slug}$`, 'i') },
  }).lean<IBiopage>();
  if (!biopage) return null;

  // Obtener los detalles de los links (destinationUrl, _id)
  const shortIds = biopage.links.map((l) => l.shortId);
  const linksDocs = await Link.find({ slug: { $in: shortIds } }).lean();

  // Crear un mapa para acceso rápido
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linksMap = new Map(linksDocs.map((l: any) => [l.slug, l]));

  const links =
    ((biopage.links || []) as unknown[]).map((link: unknown) => {
      const l = link as { shortUrl?: string; label?: string; shortId?: string };
      const linkDoc = linksMap.get(l.shortId);

      // Si el link original fue borrado, podríamos querer ocultarlo o mostrarlo roto.
      // Aquí asumiremos que si no existe el linkDoc, no lo incluimos o ponemos valores vacíos.
      if (!linkDoc) return null;

      return {
        shortUrl: l.shortUrl ?? '',
        label: l.label ?? '',
        destinationUrl: linkDoc.destinationUrl,
        linkId: linkDoc._id.toString(),
      };
    }).filter((l): l is NonNullable<typeof l> => l !== null) ?? [];

  return {
    slug: biopage.slug,
    userId: biopage.userId,
    links,
    textColor: biopage.textColor || '#ffffff',
    background: biopage.background || { base: '#000000' },
    avatarUrl: biopage.avatarUrl || '',
    description: biopage.description || undefined,
  };
});
