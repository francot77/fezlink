'use client';
import Modal from '@/components/Modal';
import ClicksGlobe from '@/components/Globe';
import { toast } from 'sonner';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface Link {
    id: string;
    originalUrl: string;
    shortUrl: string;
    clicks: number;
    source?: string;
}

export interface LinkStat {
    _id: string;
    linkId: string;
    __v: number;
    countries: {
        country: string;
        clicksCount: number;
    }[];
}

const useLinks = (options?: { autoLoad?: boolean }) => {
    const autoLoad = options?.autoLoad ?? true;
    const [links, setLinks] = useState<Link[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [newUrl, setNewUrl] = useState('https://');
    const [newSource, setNewSource] = useState('');
    const [selectedLink, setSelectedLink] = useState<Link | null>(null);
    const [linkStats, setLinkStats] = useState<LinkStat | null>(null);
    const [modalType, setModalType] = useState<null | 'stats' | 'delete'>(null);
    const [deleteInput, setDeleteInput] = useState<string>('');

    const refreshLinks = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/links');
            const data = await res.json();
            setLinks(data.links || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (autoLoad) refreshLinks();
    }, [refreshLinks, autoLoad]);

    const addLink = useCallback(
        async (originalUrl: string, source?: string) => {
            toast.promise(
                async () => {
                    const res = await fetch('/api/links', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ originalUrl, source }),
                    });
                    const newLink = await res.json();
                    if (newLink.error) throw new Error(newLink.error);
                    setLinks((prev) => [...prev, newLink]);
                    setNewUrl('https://');
                    setNewSource('');
                },
                {
                    loading: 'Agregando link...',
                    success: 'Link agregado correctamente',
                    error: (err) => `Error: ${err.message}`,
                    position: 'top-center',
                    richColors: true,
                }
            );
        },
        []
    );

    const getStats = useCallback(async (link: Link) => {
        setSelectedLink(link);
        setLinkStats(null);
        setModalType('stats');
        try {
            const res = await fetch(`/api/stats/${link.id}`);
            if (res.ok) {
                const stats = await res.json();
                if (!stats.error) {
                    setLinkStats(stats);
                    return;
                }
                toast.info('No hay clicks en este enlace aun', { richColors: true, position: 'top-center' });
            }
        } catch (error) {
            console.error(error);
        }
    }, []);

    const deleteLink = useCallback(
        async (id: string) => {
            if (deleteInput !== 'DELETE') {
                toast.info('Debes escribir DELETE para borrar el link', { richColors: true, position: 'top-center' });
                return;
            }

            await fetch(`/api/links/${id}`, { method: 'DELETE' });
            setLinks((prev) => prev.filter((link) => link.id !== id));
            setDeleteInput('');
            setModalType(null);
            setSelectedLink(null);
        },
        [deleteInput]
    );

    const handleDelete = useCallback((link: Link) => {
        setSelectedLink(link);
        setModalType('delete');
    }, []);

    const closeModal = useCallback(() => {
        setModalType(null);
        setSelectedLink(null);
        setLinkStats(null);
        setDeleteInput('');
    }, []);

    const modals = useMemo(() => {
        if (!modalType || !selectedLink) return null;

        const isStats = modalType === 'stats';
        const hasCountries = (linkStats?.countries?.length ?? 0) > 0;
        const totalClicksByCountry = linkStats?.countries?.reduce((acc, item) => acc + (item.clicksCount ?? 0), 0) ?? 0;

        return (
            <Modal
                isOpen
                title={isStats ? 'Métricas del link' : 'Borrar Link'}
                isStats={isStats}
                onCancel={closeModal}
                onAccept={modalType === 'delete' ? () => deleteLink(selectedLink.id) : closeModal}
                description={
                    isStats ? (
                        <div className="space-y-4 text-left text-gray-200">
                            <div className="grid gap-3 rounded-xl border border-gray-800 bg-gray-900/60 p-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-wide text-gray-400">Link original</p>
                                    <a
                                        href={selectedLink.originalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="break-all text-sm font-medium text-blue-300 hover:text-blue-200"
                                    >
                                        {selectedLink.originalUrl}
                                    </a>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-wide text-gray-400">Link acortado</p>
                                    <a
                                        href={selectedLink.shortUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="break-all text-sm font-medium text-blue-300 hover:text-blue-200"
                                    >
                                        {selectedLink.shortUrl}
                                    </a>
                                </div>
                                <div className="sm:col-span-2 flex flex-wrap gap-2 pt-1 text-xs text-gray-300">
                                    <span className="rounded-full bg-gray-800 px-3 py-1 font-semibold text-blue-200">ID: {selectedLink.id}</span>
                                    <span className="rounded-full bg-gray-800 px-3 py-1 font-semibold text-emerald-200">Clicks totales: {totalClicksByCountry}</span>
                                    {hasCountries && (
                                        <span className="rounded-full bg-gray-800 px-3 py-1 font-semibold text-amber-200">
                                            Países detectados: {linkStats?.countries.length}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                                <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4 shadow-inner">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-gray-400">Mapa de clics</p>
                                            <h3 className="text-lg font-semibold text-white">Distribución global</h3>
                                        </div>
                                        {hasCountries && (
                                            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                                                {totalClicksByCountry} clics en total
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-4 h-[280px] sm:h-[340px] lg:h-[380px]">
                                        {!linkStats ? (
                                            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-900/60 text-gray-400">
                                                Cargando distribución global...
                                            </div>
                                        ) : hasCountries ? (
                                            <ClicksGlobe countries={linkStats.countries} />
                                        ) : (
                                            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-900/60 text-center text-gray-400">
                                                No se registraron clics para este enlace aún.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4 shadow-inner">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-gray-400">Detalle por país</p>
                                            <h3 className="text-lg font-semibold text-white">Clics por país</h3>
                                        </div>
                                        {hasCountries && (
                                            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200">
                                                {linkStats?.countries.length} países
                                            </span>
                                        )}
                                    </div>

                                    {!linkStats ? (
                                        <div className="mt-4 rounded-lg border border-dashed border-gray-700 bg-gray-900/60 p-4 text-sm text-gray-400">
                                            Preparando métricas por país...
                                        </div>
                                    ) : hasCountries ? (
                                        <div className="mt-4 space-y-2 max-h-[420px] overflow-y-auto pr-1">
                                            {linkStats.countries.map((country) => (
                                                <div
                                                    key={country.country}
                                                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-800 bg-gray-900 px-3 py-2"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-sm font-semibold text-blue-200">
                                                            {country.country.slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-white">{country.country}</p>
                                                            <p className="text-xs text-gray-400">Clics registrados</p>
                                                        </div>
                                                    </div>
                                                    <span className="rounded-full bg-gray-800 px-3 py-1 text-sm font-semibold text-emerald-200">
                                                        {country.clicksCount}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="mt-4 rounded-lg border border-dashed border-gray-700 bg-gray-900/60 p-4 text-sm text-gray-400">
                                            Aún no hay datos de países para este enlace.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col justify-center items-center gap-3 text-gray-200">
                            <p className="text-center">¿Está seguro que desea borrar el link?</p>
                            <strong className="text-red-400">{selectedLink.shortUrl}</strong>
                            <span className="text-sm text-gray-400">Escribe DELETE para confirmar</span>
                            <input
                                value={deleteInput}
                                required
                                onChange={(e) => setDeleteInput(e.target.value)}
                                className="p-2 w-full bg-gray-700 rounded-md text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="DELETE"
                            />
                        </div>
                    )
                }
            />
        );
    }, [modalType, selectedLink, closeModal, deleteLink, deleteInput, linkStats]);

    return {
        links,
        loading,
        newUrl,
        setNewUrl,
        newSource,
        setNewSource,
        addLink,
        getStats,
        deleteLink,
        handleDelete,
        selectedLink,
        linkStats,
        modalType,
        modals,
    };
};

export default useLinks;
