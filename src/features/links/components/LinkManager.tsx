'use client';

import { useMemo, useState, useEffect } from 'react';
import { BarChart3, Link as LinkIcon, Loader2, TrendingUp, Search, X } from 'lucide-react';
import useLinks, { Link } from '@/hooks/useLinks';
import LinkModals from './LinkModals';
import { SupportedLanguage } from '@/types/i18n';
import { useTranslations } from 'next-intl';
import StatsGrid from './StatsGrid';
import NewLinkForm from './NewLinkForm';
import { LinkCard } from './LinkCard';
import { LinkSkeleton } from './LinkSkeleton';

interface LinkManagerProps {
    linkState?: ReturnType<typeof useLinks>;
    language?: SupportedLanguage;
}

const LinkManager = ({ linkState, language = 'en' }: LinkManagerProps) => {
    const fallbackState = useLinks();
    const {
        links,
        newUrl,
        setNewUrl,
        loading,
        addLink,
        openStats,
        handleDelete,
        selectedLink,
        modalType,
        deleteInput,
        setDeleteInput,
        deleteLink,
        closeModal,
        countries,
        hasCountries,
        totalClicksByCountry,
    } = linkState ?? fallbackState;

    const [searchQuery, setSearchQuery] = useState('');
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
    const [urlPreview, setUrlPreview] = useState('');

    const totalClicks = useMemo(
        () => links.reduce((acc, link) => acc + (link.clicks ?? 0), 0),
        [links]
    );
    const tLinks = useTranslations('links');

    const filteredLinks = useMemo(() => {
        if (!searchQuery.trim()) return links;
        const query = searchQuery.toLowerCase();
        return links.filter(
            (link) =>
                link.shortUrl?.toLowerCase().includes(query) ||
                link.destinationUrl.toLowerCase().includes(query)
        );
    }, [links, searchQuery]);

    const handleAdd = () => {
        if (!newUrl || !newUrl.startsWith('http')) return;
        addLink(newUrl.trim());
        setUrlPreview('');
    };

    const handleDeleteWithLoading = async (link: Link) => {
        setDeletingIds((prev) => new Set(prev).add(link.id));
        await handleDelete(link);
        setDeletingIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(link.id);
            return newSet;
        });
    };

    useEffect(() => {
        if (newUrl && newUrl.startsWith('http')) {
            try {
                const url = new URL(newUrl);
                setUrlPreview(url.hostname);
            } catch {
                setUrlPreview('');
            }
        } else {
            setUrlPreview('');
        }
    }, [newUrl]);

    return (
        <div className="space-y-6">
            <LinkModals
                selectedLink={selectedLink}
                modalType={modalType}
                deleteInput={deleteInput}
                setDeleteInput={setDeleteInput}
                deleteLink={deleteLink}
                closeModal={closeModal}
                countries={countries}
                hasCountries={hasCountries}
                totalClicksByCountry={totalClicksByCountry}
            />
            <StatsGrid linksCount={links.length} totalClicks={totalClicks} />

            <NewLinkForm
                newUrl={newUrl}
                setNewUrl={setNewUrl}
                onAdd={handleAdd}
                urlPreview={urlPreview}
            />

            <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold text-white">{tLinks('myLinks')}</h2>

                    {links.length > 0 && (
                        <div className="relative max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={tLinks('search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-10 text-sm text-white backdrop-blur-sm transition-all focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    )}

                    {loading && (
                        <span className="flex items-center gap-2 text-sm text-gray-400">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {tLinks('loading')}
                        </span>
                    )}
                </div>

                {loading && links.length === 0 ? (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {[1, 2, 3, 4].map((i) => (
                            <LinkSkeleton key={i} />
                        ))}
                    </div>
                ) : links.length === 0 ? (
                    <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/10 bg-gradient-to-br from-gray-900/40 via-black/40 to-gray-900/40 backdrop-blur-xl p-12 animate-in fade-in slide-in-from-bottom-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />
                        <div className="relative text-center space-y-3">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 ring-1 ring-white/10">
                                <LinkIcon size={28} className="text-emerald-400" />
                            </div>
                            <p className="text-lg text-gray-400">{tLinks('empty')}</p>
                        </div>
                    </div>
                ) : filteredLinks.length === 0 ? (
                    <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/10 bg-gradient-to-br from-gray-900/40 via-black/40 to-gray-900/40 backdrop-blur-xl p-12">
                        <div className="relative text-center space-y-3">
                            <Search className="mx-auto h-12 w-12 text-gray-500" />
                            <p className="text-lg text-gray-400">{tLinks('noResults')}</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {filteredLinks.map((link, index) => (
                            <LinkCard
                                key={link.id}
                                link={link}
                                language={language}
                                onStats={() => openStats(link)}
                                onDelete={() => handleDeleteWithLoading(link)}
                                isDeleting={deletingIds.has(link.id)}
                                index={index}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LinkManager;


