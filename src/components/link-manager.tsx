'use client';

import { useMemo } from 'react';
import { BarChart3, ExternalLink, Link as LinkIcon, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import Button from './button';
import useLinks, { Link } from '@/hooks/useLinks';
import { SupportedLanguage } from '@/types/i18n';

interface LinkManagerProps {
    linkState?: ReturnType<typeof useLinks>;
    language?: SupportedLanguage;
}

const translations: Record<SupportedLanguage, { [key: string]: string }> = {
    en: {
        clicks: 'clicks',
        viewMetrics: 'View metrics',
        stats: 'Statistics',
        openLink: 'Open link',
        delete: 'Delete',
        activeLinks: 'Active links',
        totalClicks: 'Total clicks',
        averagePerLink: 'Average per link',
        addNewLink: 'Add new link',
        addLink: 'Add link',
        add: 'Add',
        myLinks: 'My links',
        loading: 'Loading',
        empty: 'You do not have any links yet. Add your first link to start measuring results.',
        placeholder: 'https://example.com',
    },
    es: {
        clicks: 'clicks',
        viewMetrics: 'Ver métricas',
        stats: 'Estadísticas',
        openLink: 'Abrir link',
        delete: 'Eliminar',
        activeLinks: 'Links activos',
        totalClicks: 'Clicks totales',
        averagePerLink: 'Promedio por link',
        addNewLink: 'Agregar nuevo link',
        addLink: 'Agregar Link',
        add: 'Añadir',
        myLinks: 'Mis links',
        loading: 'Cargando',
        empty: 'Aún no tienes links creados. Agrega tu primer enlace para comenzar a medir resultados.',
        placeholder: 'https://example.com',
    },
};

const LinkCard = ({
    link,
    onStats,
    onDelete,
    language = 'en',
}: {
    link: Link;
    onStats: () => void;
    onDelete: () => void;
    language?: SupportedLanguage;
}) => {
    const hostname = useMemo(() => link.shortUrl.match(/^https?:\/\/(.+)/)?.[1] ?? link.shortUrl, [link.shortUrl]);
    const originalHost = useMemo(
        () => link.originalUrl.match(/^https?:\/\/([^/]+)/)?.[1] ?? link.originalUrl,
        [link.originalUrl]
    );
    const t = translations[language];

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-gray-700 bg-gray-800/70 p-4 shadow-inner">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/20 text-blue-300">
                    <LinkIcon size={18} />
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm text-gray-400">{originalHost}</p>
                    <a
                        className="truncate text-lg font-semibold text-white hover:text-blue-300"
                        href={link.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {hostname}
                    </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="rounded-full bg-gray-700 px-3 py-1 text-xs font-medium">{link.clicks} {t.clicks}</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
                <Button
                    title={t.viewMetrics}
                    onClick={onStats}
                    className="flex items-center gap-2 bg-blue-600 px-3 py-2 text-sm hover:bg-blue-700"
                >
                    <BarChart3 size={16} />
                    {t.stats}
                </Button>
                <a
                    href={link.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-md border border-gray-600 px-3 py-2 text-gray-200 transition hover:border-blue-500 hover:text-white"
                >
                    <ExternalLink size={16} /> {t.openLink}
                </a>
                <button
                    onClick={onDelete}
                    className="flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                    <Trash2 size={16} /> {t.delete}
                </button>
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
        getStats,
        handleDelete,
        modals,
    } = linkState ?? fallbackState;

    const totalClicks = useMemo(() => links.reduce((acc, link) => acc + (link.clicks ?? 0), 0), [links]);
    const t = translations[language];

    const handleAdd = () => {
        if (!newUrl || !newUrl.startsWith('http')) return;
        addLink(newUrl.trim());
    };

    return (
        <div className="space-y-6">
            {modals}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div className="rounded-lg border border-gray-700 bg-gray-800/70 p-4 shadow">
                    <p className="text-sm text-gray-400">{t.activeLinks}</p>
                    <p className="text-3xl font-bold text-white">{links.length}</p>
                </div>
                <div className="rounded-lg border border-gray-700 bg-gray-800/70 p-4 shadow">
                    <p className="text-sm text-gray-400">{t.totalClicks}</p>
                    <p className="text-3xl font-bold text-white">{totalClicks}</p>
                </div>
                <div className="rounded-lg border border-gray-700 bg-gray-800/70 p-4 shadow">
                    <p className="text-sm text-gray-400">{t.averagePerLink}</p>
                    <p className="text-3xl font-bold text-white">
                        {links.length === 0 ? 0 : Math.round(totalClicks / links.length)}
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-900/60 p-4 shadow-lg">
                <p className="mb-2 text-sm font-semibold text-white">{t.addNewLink}</p>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <input
                        type="text"
                        placeholder={t.placeholder}
                        value={newUrl}
                        onChange={(e) => {
                            let value = e.target.value;
                            if (!value.startsWith('http')) {
                                value = 'https://' + value.replace(/^https?:\/\//, '');
                            }
                            setNewUrl(value);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        className={`w-full rounded-md border px-3 py-2 text-white focus:outline-none focus:ring-2 ${
                            newUrl && newUrl.startsWith('http')
                                ? 'border-gray-600 bg-gray-800 focus:ring-green-500'
                                : 'border-red-500 bg-gray-900 focus:ring-red-500'
                        }`}
                    />
                    <Button
                        title={t.addLink}
                        disabled={!newUrl || !newUrl.startsWith('http')}
                        onClick={handleAdd}
                        className={`flex items-center gap-2 px-4 py-2 text-sm ${
                            newUrl && newUrl.startsWith('http')
                                ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30'
                                : 'bg-gray-700 text-gray-400'
                        }`}
                    >
                        <PlusCircle size={16} />
                        {t.add}
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm uppercase tracking-wide text-gray-400">{t.myLinks}</p>
                    {loading && (
                        <span className="flex items-center gap-2 text-xs text-gray-400">
                            <Loader2 className="h-4 w-4 animate-spin" /> {t.loading}
                        </span>
                    )}
                </div>
                {links.length === 0 && !loading && (
                    <div className="rounded-lg border border-dashed border-gray-700 bg-gray-800/40 p-6 text-center text-gray-400">
                        {t.empty}
                    </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                    {links.map((link) => (
                        <LinkCard
                            key={link.id}
                            link={link}
                            language={language}
                            onStats={() => getStats(link)}
                            onDelete={() => handleDelete(link)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LinkManager;
