import { Link as LinkIcon } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { LinkType, SelectedLink } from '@/types/globals';

interface LinksSectionProps {
    links: LinkType[];
    selected: SelectedLink[];
    onToggle: (link: LinkType) => void;
    onLabelChange: (shortUrl: string, value: string) => void;
    translations: Record<string, string>;
}

export function LinksSection({ links, selected, onToggle, onLabelChange, translations: t }: LinksSectionProps) {
    return (
        <SectionCard title={t.linksTitle} description={t.linksDescription} icon={LinkIcon}>
            {links.length === 0 ? (
                <p className="text-gray-400 text-center py-8">{t.noLinks}</p>
            ) : (
                <div className="space-y-3">
                    {links.map((link) => {
                        const isSelected = selected.find((l) => l.shortUrl === link.shortUrl);
                        return (
                            <div
                                key={link.shortUrl}
                                className={`rounded-xl border transition-all duration-300 ${isSelected
                                    ? 'border-emerald-400/50 bg-emerald-500/10'
                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                <label className="flex items-start gap-3 p-4 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={!!isSelected}
                                        onChange={() => onToggle(link)}
                                        className="mt-1 h-5 w-5 cursor-pointer rounded border-gray-600 bg-gray-800 text-emerald-500 transition focus:ring-emerald-500"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white break-all">{link.destinationUrl}</p>
                                        <p className="text-xs text-gray-400 mt-1">{link.shortUrl}</p>
                                    </div>
                                </label>
                                {isSelected && (
                                    <div className="px-4 pb-4">
                                        <input
                                            type="text"
                                            placeholder={t.displayName}
                                            value={isSelected.label}
                                            onChange={(e) => onLabelChange(link.shortUrl, e.target.value)}
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white backdrop-blur-sm transition focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </SectionCard>
    );
}