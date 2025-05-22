'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import Button from '@/components/button'
import { BiopageType, LinkType, SelectedLink } from '@/types/globals'

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


    const toggleSelect = (shortUrl: string) => {
        setSelected((prev) =>
            prev.some((l) => l.shortUrl === shortUrl)
                ? prev.filter((l) => l.shortUrl !== shortUrl)
                : [...prev, { shortUrl, label: '' }]
        )
    }


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
            alert('Biopage creado correctamente.')
        } else {
            alert('Error al crear biopage')
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
                alert('Guardado correctamente')
            } else {
                alert(`Error: ${data.error || 'Error al guardar'}`)
            }
        } catch (error) {
            alert('Error al guardar biopage: ' + error)
        }
    }
    const saveBiopage = async () => {
        if (!biopage) {
            alert('No hay biopage para actualizar.')
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
                alert('Guardado correctamente')
            } else {
                alert(`Error: ${data.error || 'Error al guardar'}`)
            }
        } catch (error) {
            alert('Error al guardar biopage: ' + error)
        }
    }

    if (loading) return <div>Cargando...</div>
    if (!user) return <div>No autorizado</div>

    if (!biopage)
        return (
            <div className="flex flex-col justify-center items-center gap-2">
                <h1>No existe una biopage para este usuario</h1>
                <h2>¿Desea generarla?</h2>
                <Button title="Generar Biopage" onClick={createBiopage} />
            </div>
        )
    if (modal) return <div className='flex bg-black/70 w-full h-full p-2 flex-col gap-2'>
        <div className='flex flex-row justify-between'>
            <h1>Desea cambiar su enlace de usuario?</h1>
            <Button title='Cerrar' onClick={() => setModal(false)} className='shadow-md shadow-red-500 hover:bg-red-900 p-2' />
        </div>
        <div className='flex gap-2 flex-row'>
            <input className='border-2 p-2 rounded-md w-1/3' placeholder='Inserte un nuevo usuario' value={inputSlug} onChange={(e) => setInputslug(e.target.value)}></input>
            <Button title='Cambiar' className='border-green-500 hover:bg-green-900 shadow-md shadow-green-500 p-2' onClick={() => handleChangeSlug()} />
        </div>

        <span>Tenga en cuenta que el cambio puede hacerse cada 3 dias, elija bien</span>
    </div>
    return (
        <div className="p-4 max-w-md text-white">
            <div className='flex flex-col mb-3'>
                <h2 className="text-2xl font-bold mb-2 ">Editar Biopage</h2>
                <div className='flex flex-row gap-2.5 items-center'>
                    <h3 className='text-xl mb-2'>Tu usuario es: <span className='text-red-700'>@{biopage.slug}</span></h3>
                    {isPremium ? <Button title='Cambiar' className='border-green-500 hover:bg-green-900 shadow-md shadow-green-500 p-2' onClick={() => setModal(true)} /> : null}
                </div>
                <span >Tipo de cuenta: {isPremium ? <span className='font-bold text-yellow-600'>Premium 🔥</span> : <span className='text-green-400'>Free</span>}</span>
            </div>
            <section className="mb-4">
                <h3 className="font-semibold mb-1">Links para mostrar:</h3>
                {links.length === 0 ? (
                    <p>No hay links disponibles</p>
                ) : (
                    links.map((link) => {
                        const isSelected = selected.find((l) => l.shortUrl === link.shortUrl)
                        return (
                            <div key={link.shortUrl} className="border-b py-1">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={!!isSelected}
                                        onChange={() => toggleSelect(link.shortUrl)}
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
                                        className="bg-gray-800 px-2 py-1 rounded w-full mt-1 text-black"
                                    />
                                )}
                            </div>
                        )
                    })
                )}
            </section>

            <section className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label htmlFor="bg-color" className="block text-sm mb-1">
                        Fondo
                    </label>
                    <input
                        id="bg-color"
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="cursor-pointer"
                    />
                </div>

                <div>
                    <label htmlFor="text-color" className="block text-sm mb-1">
                        Texto
                    </label>
                    <input
                        id="text-color"
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="cursor-pointer"
                    />
                </div>
            </section>
            <div className='flex flex-row gap-4 items-center justify-center'>
                <button
                    onClick={saveBiopage}
                    className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded w-full text-nowrap"
                >
                    Guardar cambios
                </button>

                <Link
                    href={`/@${biopage.slug}`}
                    className="block bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-center text-nowrap"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Ver Biopage
                </Link>
            </div>

        </div>
    )
}
