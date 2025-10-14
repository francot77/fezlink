/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import Button from '@/components/button'
import { BiopageType, LinkType, SelectedLink } from '@/types/globals'
import { toast } from 'sonner'
import { UploadButton } from '@/utils/uploadthings'
import CustomModal from '@/components/Modalv2'
import BiopagePreview from '@/components/biopagepreview'

export default function BiopageEditor() {
    const { user } = useUser()
    const [links, setLinks] = useState<LinkType[]>([])
    const [selected, setSelected] = useState<SelectedLink[]>([])
    const [bgColor, setBgColor] = useState('#000000')
    const [textColor, setTextColor] = useState('#ffffff')
    const [loading, setLoading] = useState(true)
    const [biopage, setBiopage] = useState<BiopageType | null>(null)
    const [isPremium, setIsPremium] = useState<boolean>(false)
    const [modal, setModal] = useState<boolean>(false)
    const [avatarModal, setAvatarModal] = useState<boolean>(false)
    const [inputSlug, setInputslug] = useState<string>('')
    // Cargar biopage del usuario
    const getUserBiopage = async () => {

        const resAT = await fetch('/api/accounttype')
        if (resAT.ok) {
            const data = await resAT.json()
            if (data.isPremium) setIsPremium(data.isPremium)
        }

        setLoading(true)
        const res = await fetch('/api/biopage')
        if (res.ok) {
            const data = await res.json()
            if (data.biopage) {
                setBiopage(data.biopage)
                setSelected(data.biopage.links || [])
                setBgColor(data.biopage.backgroundColor || '#000000')
                setTextColor(data.biopage.textColor || '#ffffff')
            } else {
                setBiopage(null)
            }
        } else if (res.status === 404) {
            setBiopage(null)
        }
        setLoading(false)
    }


    const loadLinks = async () => {
        const res = await fetch('/api/links')
        const data = await res.json()
        if (res.ok) setLinks(data.links || [])
    }

    useEffect(() => {
        if (user) {
            getUserBiopage()
            loadLinks()
        }
    }, [user])


    const toggleSelect = (link: LinkType) => {
        if (!link.shortId) return;
        setSelected((prev) =>
            prev.some((l) => l.shortId === link.shortId)
                ? prev.filter((l) => l.shortId !== link.shortId)
                : [...prev, { shortId: link.shortId, shortUrl: link.shortUrl, label: '' }]
        );
    };


    const updateLabel = (shortUrl: string, value: string) => {
        setSelected((prev) =>
            prev.map((link) =>
                link.shortUrl === shortUrl ? { ...link, label: value } : link
            )
        )
    }


    const createBiopage = async () => {
        const res = await fetch('/api/biopage/create', {
            method: 'POST',
        })
        if (res.ok) {
            const data = await res.json()
            setBiopage(data.biopage)
            setSelected(data.biopage.links || [])
            setBgColor(data.biopage.backgroundColor || '#000000')
            setTextColor(data.biopage.textColor || '#ffffff')
            toast.success('Biopage creado correctamente.', { richColors: true, position: "top-center" })
        } else {
            toast.error('Error al crear biopage', { richColors: true, position: "top-center" })
        }
    }

    const handleChangeSlug = async () => {
        try {
            const res = await fetch('/api/biopage/changeslug', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: inputSlug }),
            })
            const data = await res.json()
            if (res.ok) {
                setBiopage(prev => prev ? { ...prev, slug: data.newslug } : prev)
                toast.success('Guardado correctamente', { richColors: true, position: "top-center" })
                setModal(false)
                setBiopage((prev) => prev ? { ...prev, slug: inputSlug } : prev)
            } else {
                toast.error(`Error: ${data.error || 'Error al guardar'}`, { richColors: true, position: "top-center" })
            }
        } catch (error) {
            toast.error('Error al guardar biopage: ' + error, { richColors: true, position: "top-center" })
        }

    }
    const saveBiopage = async () => {
        console.log(selected)
        if (!biopage) {
            toast.error('No hay biopage para actualizar.', { richColors: true, position: "top-center" })
            return
        }
        try {
            const res = await fetch('/api/biopage/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    links: selected,
                    backgroundColor: bgColor,
                    textColor,
                    avatarUrl: biopage.avatarUrl || '',
                }),
            })
            const data = await res.json()
            if (res.ok) {
                setBiopage(data.biopage)
                toast.success("Guardado Correctamente", { richColors: true, position: "top-center" })
            } else {
                toast.error(`Error: ${data.error || 'Error al guardar'}`, { richColors: true, position: "top-center" })
            }
        } catch (error) {
            toast.error(`Error al guardar biopage: '${error}`, { richColors: true, position: "top-center" })
        }
    }

    if (loading) return <div>Cargando...</div>
    if (!user) return <div>No autorizado</div>

    if (!biopage)
        return (
            <div className="flex flex-col justify-center items-center gap-2">
                <h1>No existe una biopage para este usuario</h1>
                <h2>¿Desea generarla?</h2>
                <Button title="Generar Biopage" onClick={createBiopage} className='shadow-lg shadow-green-600 p-2' />
            </div>
        )
    if (modal) return <CustomModal
        title="Cambiar tu nombre de usuario"
        onClose={() => setModal(false)}
        onAccept={handleChangeSlug}
        acceptText="Guardar"
    >
        <div className='flex gap-2 flex-col'>
            <input
                className='border border-gray-600 bg-gray-800 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Inserte un nuevo usuario'
                value={inputSlug}
                onChange={(e) => setInputslug(e.target.value)}
            />
            <span className="text-xs text-gray-400">
                Tenga en cuenta que el cambio puede hacerse cada 3 días, elija bien.
            </span>
        </div>
    </CustomModal>
    if (avatarModal) return <div className='flex bg-black/70 w-full p-2 flex-col gap-2'>
        <div className='flex flex-col items-center'>
            <h1>Desea cambiar su avatar?</h1>
            <div className="w-30 h-30 rounded-full overflow-hidden">
                <img
                    src={biopage.avatarUrl || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"}
                    alt="avatar"
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
        <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
                console.log("Files: ", res);
                toast.success("Se cambio con exito su avatar", { richColors: true, position: "top-center" });
            }}
            onUploadError={(error: Error) => {

                toast.error(`Error! ${error.message}`, { richColors: true, position: "top-center" });
            }}
        />
        <Button title='Cerrar' onClick={() => setAvatarModal(false)} className='bg-red-600 rounded-md p-2 hover:bg-red-900 w-fit self-center' />
    </div>



    return (
        <div className="p-4 justify-around text-white flex flex-col md:flex-row items-center gap-2">
            <div className="flex flex-col gap-4 mb-6">
                {/* Header con Avatar */}
                <div className="grid grid-cols-[auto_1fr] items-center gap-4 bg-gray-800/50 p-4 rounded-lg">
                    <div
                        onClick={() => setAvatarModal(true)}
                        className="w-26 h-26 rounded-full overflow-hidden cursor-pointer ring-3 ring-blue-500 hover:ring-blue-400 transition"
                    >
                        <img src={biopage.avatarUrl || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">@{biopage.slug}</h2>
                        <span className={`inline-block mt-1 px-2 py-1 text-xs rounded ${isPremium ? 'bg-yellow-600 text-black font-semibold' : 'bg-green-700'
                            }`}>
                            {isPremium ? 'Premium 🔥' : 'Free'}
                        </span>
                    </div>
                    {isPremium && (
                        <button
                            onClick={() => setModal(true)}
                            className="ml-auto text-sm text-blue-400 hover:text-blue-300"
                        >
                            Cambiar nombre
                        </button>
                    )}
                </div>


                <section className="bg-gray-800/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Links para mostrar:</h3>
                    {links.length === 0 ? (
                        <p className="text-gray-400">No hay links disponibles</p>
                    ) : (
                        links.map((link) => {
                            const isSelected = selected.find((l) => l.shortUrl === link.shortUrl);
                            return (
                                <div key={link.shortUrl} className="border-b border-gray-700 py-2">
                                    <label className="flex items-center gap-2 mb-1">
                                        <input
                                            type="checkbox"
                                            checked={!!isSelected}
                                            onChange={() => toggleSelect(link)}
                                            className="cursor-pointer"
                                        />
                                        <span>{link.originalUrl}</span>
                                    </label>
                                    {isSelected && (
                                        <input
                                            type="text"
                                            placeholder="Nombre para mostrar"
                                            value={isSelected.label}
                                            onChange={(e) => updateLabel(link.shortUrl, e.target.value)}
                                            className="bg-gray-700 px-3 py-1 rounded w-full mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                </div>
                            );
                        })
                    )}
                </section>


                <section className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                        <label htmlFor="bg-color" className="block text-sm mb-2">Color de fondo</label>
                        <input
                            id="bg-color"
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="cursor-pointer w-12 h-12 border border-gray-600 rounded"
                        />
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                        <label htmlFor="text-color" className="block text-sm mb-2">Color de texto</label>
                        <input
                            id="text-color"
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="cursor-pointer w-12 h-12 border border-gray-600 rounded"
                        />
                    </div>
                </section>


                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                        onClick={saveBiopage}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition flex-1 my-auto"
                    >
                        Guardar
                    </button>
                    <Link
                        href={`/@${biopage.slug}`}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition flex-1 text-center my-auto"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Ver Biopage
                    </Link>
                </div>
            </div>
            <div className="md:w-1/2 h-fit flex justify-center flex-col items-center bg-gray-800/50 rounded-md p-3">
                <span>Biopage Preview</span>
                <BiopagePreview
                    bgColor={bgColor}
                    textColor={textColor}
                    avatarUrl={biopage?.avatarUrl || ''}
                    slug={biopage?.slug || 'usuario'}
                    links={selected}
                />
            </div>
        </div>
    )
}
