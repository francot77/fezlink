'use client';

import { useMemo } from 'react';
import { BarChart3, ExternalLink, Link as LinkIcon, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import Button from './button';
import useLinks, { Link } from '@/hooks/useLinks';

interface LinkManagerProps {
    linkState?: ReturnType<typeof useLinks>;
}

const LinkCard = ({ link, onStats, onDelete }: { link: Link; onStats: () => void; onDelete: () => void }) => {
    const hostname = useMemo(() => link.shortUrl.match(/^https?:\/\/(.+)/)?.[1] ?? link.shortUrl, [link.shortUrl]);
    const originalHost = useMemo(
        () => link.originalUrl.match(/^https?:\/\/([^/]+)/)?.[1] ?? link.originalUrl,
        [link.originalUrl]
    );

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
                    <span className="rounded-full bg-gray-700 px-3 py-1 text-xs font-medium">{link.clicks} clicks</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
                <Button
                    title="Ver métricas"
                    onClick={onStats}
                    className="flex items-center gap-2 bg-blue-600 px-3 py-2 text-sm hover:bg-blue-700"
                >
                    <BarChart3 size={16} />
                    Estadísticas
                </Button>
                <a
                    href={link.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-md border border-gray-600 px-3 py-2 text-gray-200 transition hover:border-blue-500 hover:text-white"
                >
                    <ExternalLink size={16} /> Abrir link
                </a>
                <button
                    onClick={onDelete}
                    className="flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                    <Trash2 size={16} /> Eliminar
                </button>
            </div>
        </div>
    );
};

const LinkManager = ({ linkState }: LinkManagerProps) => {
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

    const handleAdd = () => {
        if (!newUrl || !newUrl.startsWith('http')) return;
        addLink(newUrl.trim());
    };

    return (
        <div className="space-y-6">
            {modals}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-gray-700 bg-gray-800/70 p-4 shadow">
                    <p className="text-sm text-gray-400">Links activos</p>
                    <p className="text-3xl font-bold text-white">{links.length}</p>
                </div>
                <div className="rounded-lg border border-gray-700 bg-gray-800/70 p-4 shadow">
                    <p className="text-sm text-gray-400">Clicks totales</p>
                    <p className="text-3xl font-bold text-white">{totalClicks}</p>
                </div>
                <div className="rounded-lg border border-gray-700 bg-gray-800/70 p-4 shadow">
                    <p className="text-sm text-gray-400">Promedio por link</p>
                    <p className="text-3xl font-bold text-white">
                        {links.length === 0 ? 0 : Math.round(totalClicks / links.length)}
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-900/60 p-4 shadow-lg">
                <p className="mb-2 text-sm font-semibold text-white">Agregar nuevo link</p>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <input
                        type="text"
                        placeholder="https://example.com"
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
                        title="Agregar Link"
                        disabled={!newUrl || !newUrl.startsWith('http')}
                        onClick={handleAdd}
                        className={`flex items-center gap-2 px-4 py-2 text-sm ${
                            newUrl && newUrl.startsWith('http')
                                ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30'
                                : 'bg-gray-700 text-gray-400'
                        }`}
                    >
                        <PlusCircle size={16} />
                        Añadir
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm uppercase tracking-wide text-gray-400">Mis links</p>
                    {loading && (
                        <span className="flex items-center gap-2 text-xs text-gray-400">
                            <Loader2 className="h-4 w-4 animate-spin" /> Cargando
                        </span>
                    )}
                </div>
                {links.length === 0 && !loading && (
                    <div className="rounded-lg border border-dashed border-gray-700 bg-gray-800/40 p-6 text-center text-gray-400">
                        Aún no tienes links creados. Agrega tu primer enlace para comenzar a medir resultados.
                    </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                    {links.map((link) => (
                        <LinkCard
                            key={link.id}
                            link={link}
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
