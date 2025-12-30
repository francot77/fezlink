import { ExternalLink, Eye, } from 'lucide-react';
import BiopagePreview from '@/components/biopagepreview';
import { SelectedLink } from '@/types/globals';
import { SupportedLanguage } from '@/types/i18n';
import { memo } from 'react';
import Link from 'next/link';

interface PreviewSectionProps {
    bgColor: string;
    textColor: string;
    avatarUrl: string;
    slug: string;
    links: SelectedLink[];
    description: string;
    language: SupportedLanguage;
    backgroundImageUrl?: string;
    backgroundBlur: number;
    backgroundZoom: number;
    backgroundPositionX: number;
    backgroundPositionY: number;
    translations: Record<string, string>;
}

export const PreviewSection = memo(function PreviewSection({
    bgColor,
    textColor,
    avatarUrl,
    slug,
    links,
    description,
    language,
    backgroundImageUrl,
    backgroundBlur,
    backgroundZoom,
    backgroundPositionX,
    backgroundPositionY,
    translations: t,
}: PreviewSectionProps) {
    return (
        <div className="sticky top-6 h-fit">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl">
                {bgColor?.startsWith('linear-gradient') && (
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: bgColor,
                            opacity: 0.65,
                        }}
                    />
                )}

                <div className="relative p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Eye size={18} className="text-purple-400" />
                            <span className="text-sm font-medium text-gray-300">
                                {t.preview}
                            </span>
                        </div>
                        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
                            {language.toUpperCase()}
                        </div>
                    </div>

                    <BiopagePreview
                        bgColor={bgColor}
                        textColor={textColor}
                        avatarUrl={avatarUrl}
                        slug={slug}
                        links={links}
                        description={description}
                        language={language}
                        backgroundImageUrl={backgroundImageUrl}
                        backgroundBlur={backgroundBlur}
                        backgroundPositionX={backgroundPositionX}
                        backgroundPositionY={backgroundPositionY}
                        backgroundZoom={backgroundZoom}
                    />


                </div>

            </div>
            <div className="flexborder-t border-white/10 my-3">
                <Link
                    href={`/@${slug}`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-gray-300 transition hover:bg-white/10"
                >
                    <ExternalLink size={18} />
                    {t.viewBiopage}
                </Link>

            </div>
        </div>
    );
});
