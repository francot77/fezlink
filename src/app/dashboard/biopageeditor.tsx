'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import Button from '@/components/button'

type LinkType = {
    _id: string
    shortUrl: string
    originalUrl: string
}

type SelectedLink = {
    shortUrl: string
    label: string
}

type BiopageType = {
    slug: string
    links: SelectedLink[]
    backgroundColor: string
    textColor: string
    avatarUrl?: string
}

export default function BiopageEditor() {
    const { user } = useUser()
    const [links, setLinks] = useState<LinkType[]>([])
    const [selected, setSelected] = useState<SelectedLink[]>([])
    const [bgColor, setBgColor] = useState('#000000')
    const [textColor, setTextColor] = useState('#ffffff')
    const [loading, setLoading] = useState(true)
    const [biopage, setBiopage] = useState<BiopageType | null>(null)

    // Cargar biopage del usuario
    const getUserBiopage = async () => {
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

    // Cargar links disponibles para seleccionar
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

    // Manejar selección/des-selección de links
    const toggleSelect = (shortUrl: string) => {
        setSelected((prev) =>
            prev.some((l) => l.shortUrl === shortUrl)
                ? prev.filter((l) => l.shortUrl !== shortUrl)
                : [...prev, { shortUrl, label: '' }]
        )
    }

    // Actualizar label del link seleccionado
    const updateLabel = (shortUrl: string, value: string) => {
        setSelected((prev) =>
            prev.map((link) =>
                link.shortUrl === shortUrl ? { ...link, label: value } : link
            )
        )
    }

    // Crear biopage (POST /api/biopage/create)
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

    // Guardar cambios (PUT /api/biopage/update)
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

    return (
        <div className="p-4 max-w-md mx-auto text-white">
            <h2 className="text-xl font-bold mb-4">Editar Biopage</h2>

            <section className="mb-6">
                <h3 className="font-semibold mb-2">Selecciona tus links:</h3>
                {links.length === 0 ? (
                    <p>No hay links disponibles</p>
                ) : (
                    links.map((link) => {
                        const isSelected = selected.find((l) => l.shortUrl === link.shortUrl)
                        return (
                            <div key={link.shortUrl} className="border-b py-2">
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

            <button
                onClick={saveBiopage}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded w-full"
            >
                Guardar cambios
            </button>

            <Link
                href={`/@${biopage.slug}`}
                className="block mt-4 bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-center"
                target="_blank"
                rel="noopener noreferrer"
            >
                Ver Biopage
            </Link>
        </div>
    )
}
