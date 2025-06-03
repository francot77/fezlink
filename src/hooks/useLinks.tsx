'use client';
import Button from '@/components/button';
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import ClicksGlobe from '@/components/Globe';
import { toast } from 'sonner';
interface Link {
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

const useLinks = () => {
    const [links, setLinks] = useState<Link[]>([]);
    const [newUrl, setNewUrl] = useState('https://');
    const [selectedLink, setSelectedLink] = useState<Link | null>(null);
    const [linkStats, setLinkStats] = useState<LinkStat | null>(null);
    const [modalType, setModalType] = useState<null | 'stats' | 'delete'>(null);
    const [deleteInput, setDeleteInput] = useState<string>('')
    useEffect(() => {
        fetch('/api/links')
            .then(res => res.json())
            .then(data => setLinks(data.links));
    }, []);

    const addLink = async (originalUrl: string) => {
        toast.promise(
            async () => {
                const res = await fetch('/api/links', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ originalUrl })
                });
                const newLink = await res.json();
                if (newLink.error) throw new Error(newLink.error);
                setLinks(prev => [...prev, newLink]);
            },
            {
                loading: 'Agregando link...',
                success: 'Link added successfully',
                error: (err) => `Error: ${err.message}`,
                position: "top-center",
                richColors: true
            }
        );
    };


    const getStats = async (link: Link) => {
        setSelectedLink(link);
        setLinkStats(null);
        setModalType('stats');
        try {
            const res = await fetch(`/api/stats/${link.id}`);
            if (res.ok) {
                const stats = await res.json();
                if (!stats.error) {
                    setLinkStats(stats);
                    return
                }
                return toast.info("No hay clicks en este enlace aun", { richColors: true, position: "top-center" })
            }

        } catch (error) {
            console.log(error)
        }
    };

    const deleteLink = async (id: string) => {
        if (deleteInput !== 'DELETE') toast.info("Debes escribir DELETE para borrar el link", { richColors: true, position: "top-center" })
        else {
            await fetch(`/api/links/${id}`, { method: 'DELETE' });
            setLinks(prev => prev.filter(link => link.id !== id));
            closeModal();
            setDeleteInput("")
        }
    };

    const handleDelete = (link: Link) => {
        setSelectedLink(link);
        setModalType('delete');
    };

    const closeModal = () => {
        setModalType(null);
        setSelectedLink(null);
        setLinkStats(null);
        setDeleteInput("")
    };

    const renderModal = () => {
        if (!modalType || !selectedLink) return null;

        const isStats = modalType === 'stats';
        console.log(selectedLink.id)
        return (
            <Modal
                isOpen
                title={isStats ? 'Informacion' : 'Borrar Link'}
                isStats={isStats}
                onCancel={closeModal}
                onAccept={
                    modalType === 'delete' ? () => deleteLink(selectedLink.id) : () => closeModal()
                }
                description={
                    isStats ? (
                        <div>
                            <p>ID: {selectedLink.id}</p>
                            <p>
                                Link Original:{' '}
                                <a
                                    href={selectedLink.originalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
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
                                >
                                    {selectedLink.shortUrl}
                                </a>
                            </p>
                            <div className="mt-4 flex justify-center items-center h-[250px]">
                                {!linkStats ? (
                                    <span>No se registraron click para este link aun!</span>
                                ) : (
                                    <ClicksGlobe countries={linkStats.countries} />
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className='flex flex-col justify-center items-center'>
                            ¿Está seguro que desea borrar el link?
                            <strong className='text-red-500'>{selectedLink.shortUrl}</strong>
                            <span>Escribe DELETE para borrar</span>
                            <input value={deleteInput} required onChange={e => setDeleteInput(e.target.value)} className='p-2 w-fit bg-gray-500 rounded-md' placeholder=''></input>
                        </div>
                    )
                }
            />
        );
    };

    const renderLinks = () => (
        <div>
            {renderModal()}

            <p>Mis Links!</p>
            <div className="flex flex-row gap-2 items-center mb-4">
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
                    className={`border p-2 rounded-md w-full focus:outline-none focus:ring-2 ${newUrl.startsWith('http') ? 'border-gray-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'
                        }`}
                />
                <Button
                    title="Agregar Link"
                    disabled={!newUrl || !newUrl.startsWith('http')}
                    onClick={() => addLink(newUrl)}
                    className={`${newUrl && newUrl.startsWith('http')
                        ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30'
                        : 'bg-gray-600 cursor-not-allowed'
                        } shadow-md px-4 py-2 rounded-md transition-all`}
                />
            </div>

            {links.length > 0 && links.map((link) => (
                <div key={link.id} className="p-1 flex flex-row gap-2 items-center">
                    <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-700 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors">
                        <span>{link.originalUrl.substring(8)}</span>
                        <a
                            href={link.shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 font-medium truncate max-w-xs hover:underline"
                        >
                            {link.shortUrl}
                        </a>

                        <div className="flex gap-1 ml-auto">
                            <button
                                onClick={() => getStats(link)}
                                className="p-1 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-full transition-all"
                                title="Ver estadísticas"
                            >
                                📊
                            </button>
                            <button
                                onClick={() => handleDelete(link)}
                                className="p-1 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-full transition-all"
                                title="Eliminar"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return { links, addLink, deleteLink, renderLinks };
};

export default useLinks;
