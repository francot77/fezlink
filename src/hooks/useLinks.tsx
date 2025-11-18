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
        async (originalUrl: string) => {
            toast.promise(
                async () => {
                    const res = await fetch('/api/links', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ originalUrl }),
                    });
                    const newLink = await res.json();
                    if (newLink.error) throw new Error(newLink.error);
                    setLinks((prev) => [...prev, newLink]);
                    setNewUrl('https://');
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
        return (
            <Modal
                isOpen
                title={isStats ? 'Información' : 'Borrar Link'}
                isStats={isStats}
                onCancel={closeModal}
                onAccept={modalType === 'delete' ? () => deleteLink(selectedLink.id) : closeModal}
                description={
                    isStats ? (
                        <div className="space-y-2 text-left text-gray-200">
                            <p className="text-sm font-semibold text-gray-300">ID: {selectedLink.id}</p>
                            <p>
                                Link Original:{' '}
                                <a
                                    href={selectedLink.originalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline break-all"
                                >
                                    {selectedLink.originalUrl}
                                </a>
                            </p>
                            <p>
                                Link Shorted:{' '}
                                <a
                                    href={selectedLink.shortUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline break-all"
                                >
                                    {selectedLink.shortUrl}
                                </a>
                            </p>
                            <div className="mt-4 flex justify-center items-center h-[250px]">
                                {!linkStats ? (
                                    <span>No se registraron clicks para este link aún.</span>
                                ) : (
                                    <ClicksGlobe countries={linkStats.countries} />
                                )}
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
