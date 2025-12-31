'use client';
import Modal from '@/components/Modal';
import ClicksGlobe from '@/components/Globe';
import { toast } from 'sonner';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { COUNTRY_NAMES } from '@/lib/countryNames';

/* ---------------- types ---------------- */

export interface Link {
    id: string;
    destinationUrl: string;
    shortUrl: string;
    slug: string;
    clicks: number;
    byCountry?: Record<string, number>; // 👈 viene directo del backend
}

/* ---------------- hook ---------------- */
function countryCodeToFlag(code: string) {
    if (code.length !== 2) return '🏳️';
    const base = 127397;
    return String.fromCodePoint(
        ...code.toUpperCase().split('').map(c => base + c.charCodeAt(0))
    );
}
const useLinks = (options?: { autoLoad?: boolean }) => {
    const autoLoad = options?.autoLoad ?? true;

    const [links, setLinks] = useState<Link[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [newUrl, setNewUrl] = useState('https://');
    const [selectedLink, setSelectedLink] = useState<Link | null>(null);
    const [modalType, setModalType] = useState<null | 'stats' | 'delete'>(null);
    const [deleteInput, setDeleteInput] = useState<string>('');

    /* ---------------- data ---------------- */

    const refreshLinks = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/links');
            const data = await res.json();
            console.log(data.links)
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

    /* ---------------- actions ---------------- */

    const addLink = useCallback(async (destinationUrl: string) => {
        toast.promise(
            async () => {
                const res = await fetch('/api/links', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ destinationUrl }),
                });
                const newLink = await res.json();
                if (newLink.error) throw new Error(newLink.error);
                setLinks(prev => [...prev, newLink]);
                setNewUrl('https://');
            },
            {
                loading: 'Agregando link...',
                success: 'Link agregado correctamente',
                error: err => `Error: ${err.message}`,
                position: 'top-center',
                richColors: true,
            }
        );
    }, []);

    const openStats = useCallback((link: Link) => {
        setSelectedLink(link);
        setModalType('stats');
    }, []);

    const handleDelete = useCallback((link: Link) => {
        setSelectedLink(link);
        setModalType('delete');
    }, []);

    const deleteLink = useCallback(async (id: string) => {
        if (deleteInput !== 'DELETE') {
            toast.info('Debes escribir DELETE para borrar el link', {
                richColors: true,
                position: 'top-center',
            });
            return;
        }

        await fetch(`/api/links/${id}`, { method: 'DELETE' });
        setLinks(prev => prev.filter(link => link.id !== id));
        closeModal();
    }, [deleteInput]);

    const closeModal = useCallback(() => {
        setModalType(null);
        setSelectedLink(null);
        setDeleteInput('');
    }, []);

    /* ---------------- derived stats ---------------- */

    const countries = useMemo(() => {
        if (!selectedLink?.byCountry) return [];

        return Object.entries(selectedLink.byCountry)
            .map(([country, clicksCount]) => ({
                country,
                clicksCount,
            }))
            .sort((a, b) => b.clicksCount - a.clicksCount);
    }, [selectedLink]);

    const hasCountries = countries.length > 0;
    const totalClicksByCountry = countries.reduce(
        (acc, c) => acc + c.clicksCount,
        0
    );

    /* ---------------- modals ---------------- */

    const modals = useMemo(() => {
        if (!modalType || !selectedLink) return null;

        const isStats = modalType === 'stats';

        return (
            <Modal
                isOpen
                title={isStats ? 'Métricas del link' : 'Borrar Link'}
                isStats={isStats}
                onCancel={closeModal}
                onAccept={
                    modalType === 'delete'
                        ? () => deleteLink(selectedLink.id)
                        : closeModal
                }
                description={
                    isStats ? (
                        <div className="space-y-4 text-left text-gray-200">
                            <div className="grid gap-3 rounded-xl border border-gray-800 bg-gray-900/60 p-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-wide text-gray-400">Link original</p>
                                    <a
                                        href={selectedLink.destinationUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="break-all text-sm font-medium text-blue-300 hover:text-blue-200"
                                    >
                                        {selectedLink.destinationUrl}
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
                                    <span className="rounded-full bg-gray-800 px-3 py-1 font-semibold text-blue-200">
                                        ID: {selectedLink.id}
                                    </span>
                                    <span className="rounded-full bg-gray-800 px-3 py-1 font-semibold text-emerald-200">
                                        Clicks totales: {totalClicksByCountry}
                                    </span>
                                    {hasCountries && (
                                        <span className="rounded-full bg-gray-800 px-3 py-1 font-semibold text-amber-200">
                                            Países detectados: {countries.length}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                                <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4 shadow-inner">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-gray-400">
                                                Mapa de clics
                                            </p>
                                            <h3 className="text-lg font-semibold text-white">
                                                Distribución global
                                            </h3>
                                        </div>
                                        {hasCountries && (
                                            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                                                {totalClicksByCountry} clics en total
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-4 h-[280px] sm:h-[340px] lg:h-[380px]">
                                        {hasCountries ? (
                                            <ClicksGlobe countries={countries} />
                                        ) : (
                                            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-900/60 text-center text-gray-400">
                                                No se registraron clics para este enlace aún.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4 shadow-inner scrollbar-thin ">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-gray-400">
                                                Detalle por país
                                            </p>
                                            <h3 className="text-lg font-semibold text-white">
                                                Clics por país
                                            </h3>
                                        </div>
                                        {hasCountries && (
                                            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200">
                                                {countries.length} países
                                            </span>
                                        )}
                                    </div>

                                    {hasCountries ? (
                                        <div className="mt-4 space-y-2 max-h-[420px] overflow-y-auto pr-1">
                                            {countries.map(country => (
                                                <div
                                                    key={country.country}
                                                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-800 bg-gray-900 px-3 py-2"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-sm font-semibold text-blue-200">
                                                            {countryCodeToFlag(country.country)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-white">
                                                                {country.country}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {COUNTRY_NAMES[country.country]}
                                                            </p>
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
                            <p className="text-center">
                                ¿Está seguro que desea borrar el link?
                            </p>
                            <strong className="text-red-400">
                                {selectedLink.shortUrl}
                            </strong>
                            <span className="text-sm text-gray-400">
                                Escribe DELETE para confirmar
                            </span>
                            <input
                                value={deleteInput}
                                required
                                onChange={e => setDeleteInput(e.target.value)}
                                className="p-2 w-full bg-gray-700 rounded-md text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="DELETE"
                            />
                        </div>
                    )
                }
            />
        );
    }, [
        modalType,
        selectedLink,
        countries,
        hasCountries,
        totalClicksByCountry,
        deleteInput,
        deleteLink,
        closeModal,
    ]);

    return {
        links,
        loading,
        newUrl,
        setNewUrl,
        addLink,
        openStats,
        handleDelete,
        modals,
    };
};

export default useLinks;
