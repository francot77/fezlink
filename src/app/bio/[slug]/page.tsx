import BioPageClient from './BioPageClient';

export default async function BioPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams?: { lang?: string } }) {
    const { slug } = await params;
    return <BioPageClient slug={slug} searchParams={searchParams} />;
}
