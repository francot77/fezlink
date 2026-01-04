'use client';

import { useMemo, useState, useEffect } from 'react';
import { BarChart3, Check, Copy, ExternalLink, Link as LinkIcon, Loader2, PlusCircle, Trash2, Instagram, MessageCircle, QrCode, TrendingUp, Search, X } from 'lucide-react';
import Button from './button';
import useLinks, { Link } from '@/hooks/useLinks';
import { SupportedLanguage } from '@/types/i18n';
import { toast } from 'sonner';

interface LinkManagerProps {
    linkState?: ReturnType<typeof useLinks>;
    language?: SupportedLanguage;
}

const translations: Record<SupportedLanguage, { [key: string]: string }> = {
    en: {
        clicks: 'clicks',
        viewMetrics: 'View metrics',
        stats: 'Analytics',
        openLink: 'Open',
        delete: 'Delete',
        activeLinks: 'Active links',
        totalClicks: 'Total clicks',
        averagePerLink: 'Avg per link',
        addNewLink: 'Create new short link',
        addLink: 'Create link',
        add: 'Create',
        myLinks: 'Your links',
        loading: 'Loading',
        empty: 'No links yet. Create your first link to start tracking.',
        placeholder: 'Paste your long URL here...',
        copy: 'Copy',
        copied: 'Copied!',
        copyInstagram: 'Instagram',
        copyWhatsapp: 'WhatsApp',
        copyQr: 'QR Code',
        quickShare: 'Quick share',
        search: 'Search links...',
        clear: 'Clear',
        deleting: 'Deleting...',
        noResults: 'No links found',
    },
    es: {
        clicks: 'clicks',
        viewMetrics: 'Ver métricas',
        stats: 'Analíticas',
        openLink: 'Abrir',
        delete: 'Eliminar',
        activeLinks: 'Links activos',
        totalClicks: 'Clicks totales',
        averagePerLink: 'Promedio',
        addNewLink: 'Crear nuevo enlace corto',
        addLink: 'Crear enlace',
        add: 'Crear',
        myLinks: 'Tus enlaces',
        loading: 'Cargando',
        empty: 'Aún no hay enlaces. Crea tu primer enlace para empezar.',
        placeholder: 'Pega tu URL larga aquí...',
        copy: 'Copiar',
        copied: '¡Copiado!',
        copyInstagram: 'Instagram',
        copyWhatsapp: 'WhatsApp',
        copyQr: 'Código QR',
        quickShare: 'Compartir rápido',
        search: 'Buscar enlaces...',
        clear: 'Limpiar',
        deleting: 'Eliminando...',
        noResults: 'No se encontraron enlaces',
    },
};

// Animated counter component
const AnimatedCounter = ({ value, duration = 1000 }: { value: number; duration?: number }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            setCount(Math.floor(progress * value));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    return <>{count.toLocaleString()}</>;
};

// Skeleton loader for links
const LinkSkeleton = () => (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl">
        <div className="p-6 space-y-4 animate-pulse">
            <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl bg-white/5" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 w-20 rounded bg-white/5" />
                    <div className="h-5 w-48 rounded bg-white/10" />
                </div>
                <div className="h-7 w-16 rounded-full bg-white/5" />
            </div>
            <div className="h-10 w-full rounded-xl bg-white/5" />
            <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-white/5" />
                <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 rounded-lg bg-white/5" />
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const LinkCard = ({
    link,
    onStats,
    onDelete,
    language = 'en',
    isDeleting = false,
    index = 0,
}: {
    link: Link;
    onStats: () => void;
    onDelete: () => void;
    language?: SupportedLanguage;
    isDeleting?: boolean;
    index?: number;
}) => {
    const safeShortUrl = link.shortUrl ?? '';
    const hostname = useMemo(
        () => safeShortUrl.match(/^https?:\/\/(.+)/)?.[1] ?? safeShortUrl,
        [safeShortUrl]
    );
    const originalHost = useMemo(
        () => link.destinationUrl.match(/^https?:\/\/([^/]+)/)?.[1] ?? link.destinationUrl,
        [link.destinationUrl]
    );
    const t = translations[language];
    const [copied, setCopied] = useState(false);
    const [channelCopied, setChannelCopied] = useState<string | null>(null);

    const buildChannelUrl = (source: string) => `${safeShortUrl}?src=${source}`;

    const handleCopy = async (value?: string) => {
        const textToCopy = value ?? safeShortUrl;
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            toast.success(t.copied, { position: 'top-center', richColors: true });
            setTimeout(() => setCopied(false), 1600);
        } catch (error) {
            console.error('Failed to copy link:', error);
            toast.error('Unable to copy link', { position: 'top-center', richColors: true });
        }
    };

    const handleChannelCopy = async (label: string, value: string) => {
        setChannelCopied(label);
        await handleCopy(value);
        setTimeout(() => setChannelCopied((current) => (current === label ? null : current)), 1600);
    };

    const channels = [
        { label: t.copyInstagram, src: 'instagram_bio', icon: Instagram, color: 'from-pink-500 to-purple-500' },
        { label: t.copyWhatsapp, src: 'whatsapp', icon: MessageCircle, color: 'from-green-500 to-emerald-600' },
        { label: t.copyQr, src: 'qr_local', icon: QrCode, color: 'from-cyan-500 to-blue-600' },
    ];

    return (
        <div
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-emerald-500/10 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
        >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Deleting overlay */}
            {isDeleting && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-red-400" />
                        <span className="text-sm font-semibold text-red-400">{t.deleting}</span>
                    </div>
                </div>
            )}

            <div className="relative p-4 sm:p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110">
                            <LinkIcon size={20} className="text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{originalHost}</p>
                            <a
                                className="block truncate text-base sm:text-lg font-semibold text-white transition-colors hover:text-emerald-400"
                                href={safeShortUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={hostname}
                            >
                                {hostname}
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 px-3 py-1.5 ring-1 ring-white/10">
                            <TrendingUp size={14} className="text-emerald-400" />
                            <span className="text-sm font-bold text-white">{link.clicks}</span>
                        </div>
                    </div>
                </div>

                {/* Copy main link button */}
                <button
                    onClick={() => handleCopy()}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-300 active:scale-95 ${copied
                        ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-500/20'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-emerald-400/40 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? t.copied : t.copy}
                </button>

                {/* Quick share channels */}
                <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{t.quickShare}</p>
                    <div className="grid grid-cols-3 gap-2">
                        {channels.map((channel) => {
                            const url = buildChannelUrl(channel.src);
                            const isCopied = channelCopied === channel.src;
                            const Icon = channel.icon;

                            return (
                                <button
                                    key={channel.src}
                                    onClick={() => handleChannelCopy(channel.src, url)}
                                    className={`group/btn relative overflow-hidden rounded-lg border p-3 transition-all duration-300 active:scale-95 ${isCopied
                                        ? 'border-emerald-400/60 bg-emerald-500/20 shadow-lg shadow-emerald-500/20'
                                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                        }`}
                                    title={channel.label}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${channel.color} opacity-0 transition-opacity duration-300 ${isCopied ? 'opacity-20' : 'group-hover/btn:opacity-10'}`} />
                                    <div className="relative flex flex-col items-center gap-1.5">
                                        {isCopied ? (
                                            <Check size={18} className="text-emerald-400" />
                                        ) : (
                                            <Icon size={18} className="text-gray-400 transition-colors group-hover/btn:text-white" />
                                        )}
                                        <span className={`text-xs font-medium transition-colors ${isCopied ? 'text-emerald-300' : 'text-gray-500 group-hover/btn:text-gray-300'
                                            }`}>
                                            {isCopied ? t.copied : channel.label}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Actions - Better mobile touch targets */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                    <button
                        onClick={onStats}
                        disabled={isDeleting}
                        className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/40 active:scale-95 disabled:opacity-50"
                    >
                        <BarChart3 size={16} />
                        <span className="hidden sm:inline">{t.stats}</span>
                    </button>
                    <a
                        href={safeShortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-gray-300 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95 ${isDeleting ? 'pointer-events-none opacity-50' : ''}`}
                    >
                        <ExternalLink size={16} />
                        <span className="hidden sm:inline">{t.openLink}</span>
                    </a>
                    <button
                        onClick={onDelete}
                        disabled={isDeleting}
                        className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-red-600/10 px-3 py-2.5 text-sm font-semibold text-red-400 ring-1 ring-red-500/20 transition-all duration-300 hover:bg-red-600/20 hover:ring-red-500/40 hover:text-red-300 active:scale-95 disabled:opacity-50"
                    >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">{t.delete}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

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
        modals,
    } = linkState ?? fallbackState;

    const [searchQuery, setSearchQuery] = useState('');
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
    const [urlPreview, setUrlPreview] = useState('');

    const totalClicks = useMemo(() => links.reduce((acc, link) => acc + (link.clicks ?? 0), 0), [links]);
    const t = translations[language];

    // Filter links based on search
    const filteredLinks = useMemo(() => {
        if (!searchQuery.trim()) return links;
        const query = searchQuery.toLowerCase();
        return links.filter(link =>
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
        setDeletingIds(prev => new Set(prev).add(link.id));
        await handleDelete(link);
        setDeletingIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(link.id);
            return newSet;
        });
    };

    // Extract domain for preview
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

    const stats = [
        {
            label: t.activeLinks,
            value: links.length,
            icon: LinkIcon,
            gradient: 'from-emerald-500/20 to-green-500/20',
            iconColor: 'text-emerald-400'
        },
        {
            label: t.totalClicks,
            value: totalClicks,
            icon: TrendingUp,
            gradient: 'from-cyan-500/20 to-blue-500/20',
            iconColor: 'text-cyan-400'
        },
        {
            label: t.averagePerLink,
            value: links.length === 0 ? 0 : Math.round(totalClicks / links.length),
            icon: BarChart3,
            gradient: 'from-purple-500/20 to-pink-500/20',
            iconColor: 'text-purple-400'
        },
    ];

    return (
        <div className="space-y-6">
            {modals}

            {/* Stats cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-xl animate-in fade-in slide-in-from-top-4"
                            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
                            <div className="relative p-4 sm:p-6 space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                                    <div className={`rounded-lg bg-white/5 p-2 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110`}>
                                        <Icon size={18} className={stat.iconColor} />
                                    </div>
                                </div>
                                <p className="text-3xl sm:text-4xl font-bold text-white">
                                    <AnimatedCounter value={stat.value} />
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Create new link */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl animate-in fade-in slide-in-from-top-4" style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />
                <div className="relative p-4 sm:p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 ring-1 ring-white/10">
                            <PlusCircle size={20} className="text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">{t.addNewLink}</h3>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder={t.placeholder}
                                value={newUrl}
                                onChange={(e) => {
                                    let value = e.target.value;
                                    if (value && !value.startsWith('http')) {
                                        value = 'https://' + value.replace(/^https?:\/\//, '');
                                    }
                                    setNewUrl(value);
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                className={`w-full rounded-xl border px-4 py-3 text-white bg-white/5 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 ${newUrl && newUrl.startsWith('http')
                                    ? 'border-white/10 focus:border-emerald-400/50 focus:ring-emerald-500/20'
                                    : 'border-red-500/50 focus:border-red-400 focus:ring-red-500/20'
                                    }`}
                            />
                            {urlPreview && (
                                <div className="absolute -bottom-6 left-0 text-xs text-emerald-400">
                                    → {urlPreview}
                                </div>
                            )}
                        </div>
                        <Button
                            title={t.addLink}
                            disabled={!newUrl || !newUrl.startsWith('http')}
                            onClick={handleAdd}
                            className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 ${newUrl && newUrl.startsWith('http')
                                ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/30 hover:scale-105 hover:shadow-emerald-500/40 active:scale-95'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <PlusCircle size={18} />
                            <span className="hidden sm:inline">{t.add}</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Search and links list */}
            <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold text-white">{t.myLinks}</h2>

                    {links.length > 0 && (
                        <div className="relative max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t.search}
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
                            {t.loading}
                        </span>
                    )}
                </div>

                {loading && links.length === 0 ? (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {[1, 2, 3, 4].map(i => <LinkSkeleton key={i} />)}
                    </div>
                ) : links.length === 0 ? (
                    <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/10 bg-gradient-to-br from-gray-900/40 via-black/40 to-gray-900/40 backdrop-blur-xl p-12 animate-in fade-in slide-in-from-bottom-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />
                        <div className="relative text-center space-y-3">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 ring-1 ring-white/10">
                                <LinkIcon size={28} className="text-emerald-400" />
                            </div>
                            <p className="text-lg text-gray-400">{t.empty}</p>
                        </div>
                    </div>
                ) : filteredLinks.length === 0 ? (
                    <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/10 bg-gradient-to-br from-gray-900/40 via-black/40 to-gray-900/40 backdrop-blur-xl p-12">
                        <div className="relative text-center space-y-3">
                            <Search className="mx-auto h-12 w-12 text-gray-500" />
                            <p className="text-lg text-gray-400">{t.noResults}</p>
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