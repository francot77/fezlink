import BioPageClient, { BioPageData } from "./BioPageClient";
import dbConnect from "@/lib/mongodb";
import Biopage, { type IBiopage } from "@/app/models/bioPages";
import type { Metadata } from "next";

type PageParams = { params: Promise<{ slug: string }> };

async function getBiopageBySlug(slug: string): Promise<BioPageData | null> {
    await dbConnect();

    const biopage = await Biopage.findOne({ slug }).lean<IBiopage>();
    if (!biopage) return null;

    return {
        slug: biopage.slug,
        links: biopage.links || [],
        textColor: biopage.textColor || '#ffffff',
        backgroundColor: biopage.backgroundColor || '#000000',
        avatarUrl: biopage.avatarUrl || "",
        description: biopage.description || undefined,
    };
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const { slug } = await params;
    const biopage = await getBiopageBySlug(slug);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL;
    const url = baseUrl ? `${baseUrl}/bio/${slug}` : undefined;
    const defaultDescription = 'Descubre y comparte tus enlaces destacados desde un perfil moderno y adaptable.';
    const title = biopage ? `@${biopage.slug} | Fezlink Bio` : 'Fezlink | Bio no encontrada';
    const description = biopage?.description || defaultDescription;
    const image = biopage?.avatarUrl || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541";

    return {
        title,
        description, other: {
            "fb:app_id": process.env.FB_APP_ID || "",
        },

        openGraph: {
            title,
            description,
            url,
            type: "profile",
            images: [
                {
                    url: image,
                    width: 512,
                    height: 512,
                    alt: biopage ? `Avatar de @${biopage.slug}` : 'Avatar genérico',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        },
    };
}

export default async function BioPage({ params }: PageParams) {
    const { slug } = await params;
    const biopage = await getBiopageBySlug(slug);

    return <BioPageClient slug={slug} initialBioPage={biopage} />;
}
