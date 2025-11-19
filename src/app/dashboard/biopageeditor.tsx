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
import { SupportedLanguage } from '@/types/i18n'

const translations: Record<SupportedLanguage, { [key: string]: string }> = {
    en: {
        loading: 'Loading...',
        unauthorized: 'Unauthorized',
        noBiopage: 'There is no biopage for this user',
        wantGenerate: 'Would you like to generate it?',
        generate: 'Generate Biopage',
        changeUsername: 'Change your username',
        save: 'Save',
        usernamePlaceholder: 'Insert a new username',
        changeNote: 'You can change it every 3 days, choose wisely.',
        avatarQuestion: 'Do you want to change your avatar?',
        avatarSuccess: 'Avatar updated successfully',
        avatarError: 'Error!',
        close: 'Close',
        premiumBadge: 'Premium 🔥',
        freeBadge: 'Free',
        changeName: 'Change name',
        linksTitle: 'Links to show:',
        noLinks: 'No links available',
        displayName: 'Display name',
        background: 'Background color',
        textColor: 'Text color',
        saveBiopage: 'Save',
        viewBiopage: 'View Biopage',
        preview: 'Biopage Preview',
        created: 'Biopage created successfully.',
        createError: 'Error creating biopage',
        saved: 'Saved successfully',
        saveError: 'Error saving biopage',
        updateError: 'There is no biopage to update.',
        slugSaved: 'Saved successfully',
        slugErrorPrefix: 'Error:',
        avatarPrompt: 'Do you want to change your avatar?',
        avatarUploadSuccess: 'Your avatar was updated successfully',
    },
    es: {
        loading: 'Cargando...',
        unauthorized: 'No autorizado',
        noBiopage: 'No existe una biopage para este usuario',
        wantGenerate: '¿Desea generarla?',
        generate: 'Generar Biopage',
        changeUsername: 'Cambiar tu nombre de usuario',
        save: 'Guardar',
        usernamePlaceholder: 'Inserte un nuevo usuario',
        changeNote: 'Tenga en cuenta que el cambio puede hacerse cada 3 días, elija bien.',
        avatarQuestion: 'Desea cambiar su avatar?',
        avatarSuccess: 'Se cambio con exito su avatar',
        avatarError: 'Error!',
        close: 'Cerrar',
        premiumBadge: 'Premium 🔥',
        freeBadge: 'Free',
        changeName: 'Cambiar nombre',
        linksTitle: 'Links para mostrar:',
        noLinks: 'No hay links disponibles',
        displayName: 'Nombre para mostrar',
        background: 'Color de fondo',
        textColor: 'Color de texto',
        saveBiopage: 'Guardar',
        viewBiopage: 'Ver Biopage',
        preview: 'Biopage Preview',
        created: 'Biopage creado correctamente.',
        createError: 'Error al crear biopage',
        saved: 'Guardado correctamente',
        saveError: 'Error al guardar',
        updateError: 'No hay biopage para actualizar.',
        slugSaved: 'Guardado correctamente',
        slugErrorPrefix: 'Error:',
        avatarPrompt: 'Desea cambiar su avatar?',
        avatarUploadSuccess: 'Se cambio con exito su avatar',
    },
}

export default function BiopageEditor({ language = 'en' }: { language?: SupportedLanguage }) {
    const t = translations[language]
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
            toast.success(t.created, { richColors: true, position: "top-center" })
        } else {
            toast.error(t.createError, { richColors: true, position: "top-center" })
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
                toast.success(t.slugSaved, { richColors: true, position: "top-center" })
                setModal(false)
                setBiopage((prev) => prev ? { ...prev, slug: inputSlug } : prev)
            } else {
                toast.error(`${t.slugErrorPrefix} ${data.error || t.saveError}`, { richColors: true, position: "top-center" })
            }
        } catch (error) {
            toast.error(`${t.saveError}: ${error}`, { richColors: true, position: "top-center" })
        }

    }
    const saveBiopage = async () => {
        console.log(selected)
        if (!biopage) {
            toast.error(t.updateError, { richColors: true, position: "top-center" })
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
                toast.success(t.saved, { richColors: true, position: "top-center" })
            } else {
                toast.error(`${t.slugErrorPrefix} ${data.error || t.saveError}`, { richColors: true, position: "top-center" })
            }
        } catch (error) {
            toast.error(`${t.saveError}: ${error}`, { richColors: true, position: "top-center" })
        }
    }

    if (loading) return <div>{t.loading}</div>
    if (!user) return <div>{t.unauthorized}</div>

    if (!biopage)
        return (
            <div className="flex flex-col justify-center items-center gap-2">
                <h1>{t.noBiopage}</h1>
                <h2>{t.wantGenerate}</h2>
                <Button title={t.generate} onClick={createBiopage} className='shadow-lg shadow-green-600 p-2' />
            </div>
        )
    if (modal) return <CustomModal
        title={t.changeUsername}
        onClose={() => setModal(false)}
        onAccept={handleChangeSlug}
        acceptText={t.save}
    >
        <div className='flex gap-2 flex-col'>
            <input
                className='border border-gray-600 bg-gray-800 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder={t.usernamePlaceholder}
                value={inputSlug}
                onChange={(e) => setInputslug(e.target.value)}
            />
            <span className="text-xs text-gray-400">
                {t.changeNote}
            </span>
        </div>
    </CustomModal>
    if (avatarModal) return <div className='flex bg-black/70 w-full p-2 flex-col gap-2'>
        <div className='flex flex-col items-center'>
            <h1>{t.avatarPrompt}</h1>
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
                toast.success(t.avatarUploadSuccess, { richColors: true, position: "top-center" });
            }}
            onUploadError={(error: Error) => {

                toast.error(`${t.avatarError} ${error.message}`, { richColors: true, position: "top-center" });
            }}
        />
        <Button title={t.close} onClick={() => setAvatarModal(false)} className='bg-red-600 rounded-md p-2 hover:bg-red-900 w-fit self-center' />
    </div>



    return (
        <div className="p-4 text-white flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
            <div className="flex flex-col gap-4 mb-6 flex-1">
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
                            {isPremium ? t.premiumBadge : t.freeBadge}
                        </span>
                    </div>
                    {isPremium && (
                        <button
                            onClick={() => setModal(true)}
                            className="ml-auto text-sm text-blue-400 hover:text-blue-300"
                        >
                            {t.changeName}
                        </button>
                    )}
                </div>


                <section className="bg-gray-800/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">{t.linksTitle}</h3>
                    {links.length === 0 ? (
                        <p className="text-gray-400">{t.noLinks}</p>
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
                                            placeholder={t.displayName}
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


                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                        <label htmlFor="bg-color" className="block text-sm mb-2">{t.background}</label>
                        <input
                            id="bg-color"
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="cursor-pointer w-12 h-12 border border-gray-600 rounded"
                        />
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                        <label htmlFor="text-color" className="block text-sm mb-2">{t.textColor}</label>
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
                        {t.saveBiopage}
                    </button>
                    <Link
                        href={`/@${biopage.slug}`}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition flex-1 text-center my-auto"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t.viewBiopage}
                    </Link>
                </div>
            </div>
            <div className="md:w-1/2 flex-1 h-fit flex justify-center flex-col items-center bg-gray-800/50 rounded-md p-3">
                <span>{t.preview}</span>
                <BiopagePreview
                    bgColor={bgColor}
                    textColor={textColor}
                    avatarUrl={biopage?.avatarUrl || ''}
                    slug={biopage?.slug || 'usuario'}
                    links={selected}
                    language={language}
                />
            </div>
        </div>
    )
}
