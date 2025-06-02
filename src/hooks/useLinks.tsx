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
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="border-2 border-gray-500 rounded-md p-2 flex-1"
                />
                <Button
                    title="Agregar Link"
                    onClick={async () => {
                        if (!newUrl.startsWith('http')) {
                            toast('URL inválida. Debe empezar con http o https', { richColors: true, position: "top-center" });
                            return;
                        }
                        await addLink(newUrl);
                        setNewUrl('https://');
                    }}
                    className='shadow-green-500 hover:bg-green-900 shadow-md p-2'
                />
            </div>

            {links.length > 0 && links.map((link) => (
                <div key={link.id} className="p-1 flex flex-row gap-2 items-center">
                    <div className="border-2 border-gray-500 rounded-md p-2 max-w-30 md:max-w-full overflow-hidden">
                        <a href={link.shortUrl} target="_blank" rel="noopener noreferrer">
                            {link.shortUrl}
                        </a>
                    </div>
                    <Button title="📊" onClick={() => getStats(link)} className='hover:shadow-blue-500 shadow-sm hover:bg-blue-900' />
                    <Button
                        title="🗑️"
                        onClick={() => handleDelete(link)}
                        className='hover:shadow-red-600 shadow-sm hover:bg-red-900'
                    />
                </div>
            ))}
        </div>
    );

    return { links, addLink, deleteLink, renderLinks };
};

export default useLinks;
