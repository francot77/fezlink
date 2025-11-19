/* eslint-disable @next/next/no-img-element */
'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
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
        changeName: 'Update username',
        linksTitle: 'Links to show',
        linksDescription: 'Pick the links that will be visible on your BioPage and customize their labels.',
        noLinks: 'No links available',
        displayName: 'Display name',
        background: 'Background color',
        appearanceTitle: 'Appearance',
        appearanceDescription: 'Adjust the palette so your BioPage matches your personal brand.',
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
        profileTitle: 'Profile & identity',
        profileDescription: 'Manage the essentials of your public BioPage profile.',
        premiumHint: 'Premium users can personalize their username.',
        cancel: 'Cancel',
        selectLanguage: 'Language',
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
        changeName: 'Actualizar usuario',
        linksTitle: 'Links para mostrar',
        linksDescription: 'Selecciona los enlaces que se verán en tu BioPage y personaliza sus etiquetas.',
        noLinks: 'No hay links disponibles',
        displayName: 'Nombre para mostrar',
        background: 'Color de fondo',
        appearanceTitle: 'Apariencia',
        appearanceDescription: 'Ajusta la paleta para que tu BioPage coincida con tu marca personal.',
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
        profileTitle: 'Perfil e identidad',
        profileDescription: 'Administra lo esencial de tu perfil público de BioPage.',
        premiumHint: 'Los usuarios Premium pueden personalizar su usuario.',
        cancel: 'Cancelar',
        selectLanguage: 'Idioma',
    },
}

const defaultAvatar =
    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'

const SectionCard = ({ title, description, children }: { title: string, description?: string, children: ReactNode }) => (
    <section className="rounded-xl border border-gray-800/60 bg-gray-900/50 p-5 shadow-lg shadow-blue-900/10">
        <header className="mb-3 space-y-1">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {description && <p className="text-sm text-gray-400">{description}</p>}
        </header>
        <div className="space-y-3">{children}</div>
    </section>
)

export default function BiopageEditor({ language = 'en' }: { language?: SupportedLanguage }) {
    const t = useMemo(() => translations[language], [language])
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
    const getUserBiopage = useCallback(async () => {
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
    }, [])

    const loadLinks = useCallback(async () => {
        const res = await fetch('/api/links')
        const data = await res.json()
        if (res.ok) setLinks(data.links || [])
    }, [])

    useEffect(() => {
        if (user) {
            getUserBiopage()
            loadLinks()
        }
    }, [getUserBiopage, loadLinks, user])


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

    if (loading) return <div className="p-6 text-gray-300">{t.loading}</div>
    if (!user) return <div className="p-6 text-red-300">{t.unauthorized}</div>

    if (!biopage)
        return (
            <div className="flex flex-col justify-center items-center gap-3 rounded-xl border border-gray-800/60 bg-gray-900/60 p-6 text-center">
                <h1 className="text-xl font-semibold text-white">{t.noBiopage}</h1>
                <p className="text-gray-400">{t.wantGenerate}</p>
                <Button title={t.generate} onClick={createBiopage} className='shadow-lg shadow-green-600 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700' />
            </div>
        )

    return (
        <div className="space-y-4 text-white">
            {modal && (
                <CustomModal
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
            )}

            {avatarModal && (
                <div className='fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4'>
                    <div className='w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-5 shadow-2xl shadow-blue-900/30 space-y-4'>
                        <div className='flex flex-col items-center gap-3 text-center'>
                            <h1 className="text-lg font-semibold">{t.avatarPrompt}</h1>
                            <div className="w-28 h-28 rounded-full overflow-hidden ring-2 ring-blue-500/60">
                                <img
                                    src={biopage.avatarUrl || defaultAvatar}
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
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setAvatarModal(false)}
                                className='rounded-md px-4 py-2 text-sm text-gray-200 border border-gray-700 hover:bg-gray-800'
                            >
                                {t.cancel}
                            </button>
                            <Button title={t.close} onClick={() => setAvatarModal(false)} className='bg-blue-600 rounded-md px-4 py-2 hover:bg-blue-700' />
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
                <div className="space-y-5">
                    <SectionCard title={t.profileTitle} description={t.profileDescription}>
                        <div className="grid gap-4 md:grid-cols-[auto,1fr] md:items-center">
                            <button
                                type="button"
                                onClick={() => setAvatarModal(true)}
                                className="relative w-28 h-28 rounded-full overflow-hidden ring-2 ring-blue-500/60 transition hover:ring-blue-400"
                            >
                                <img src={biopage.avatarUrl || defaultAvatar} alt="avatar" className="w-full h-full object-cover" />
                                <span className="absolute inset-0 grid place-items-center bg-black/50 text-sm font-semibold opacity-0 transition hover:opacity-100">
                                    {t.avatarQuestion}
                                </span>
                            </button>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold">@{biopage.slug}</h2>
                                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${isPremium ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/40' : 'bg-green-700/30 text-green-200 border border-green-500/40'}`}>
                                        {isPremium ? t.premiumBadge : t.freeBadge}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400">{t.premiumHint}</p>
                                <div className="flex flex-wrap gap-2">
                                    {isPremium && (
                                        <button
                                            onClick={() => setModal(true)}
                                            className="rounded-md border border-blue-500/50 px-4 py-2 text-sm text-blue-200 transition hover:bg-blue-500/10"
                                        >
                                            {t.changeName}
                                        </button>
                                    )}
                                    <Link
                                        href={`/@${biopage.slug}`}
                                        className="inline-flex items-center justify-center rounded-md border border-gray-700 px-4 py-2 text-sm text-gray-200 transition hover:border-blue-500 hover:text-white"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {t.viewBiopage}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title={t.linksTitle} description={t.linksDescription}>
                        {links.length === 0 ? (
                            <p className="text-gray-400">{t.noLinks}</p>
                        ) : (
                            <div className="space-y-2">
                                {links.map((link) => {
                                    const isSelected = selected.find((l) => l.shortUrl === link.shortUrl)
                                    return (
                                        <div key={link.shortUrl} className="rounded-lg border border-gray-800 bg-gray-900/60 p-3">
                                            <label className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={!!isSelected}
                                                    onChange={() => toggleSelect(link)}
                                                    className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-white break-all">{link.originalUrl}</p>
                                                    <p className="text-xs text-gray-400">{link.shortUrl}</p>
                                                </div>
                                            </label>
                                            {isSelected && (
                                                <input
                                                    type="text"
                                                    placeholder={t.displayName}
                                                    value={isSelected.label}
                                                    onChange={(e) => updateLabel(link.shortUrl, e.target.value)}
                                                    className="mt-2 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard title={t.appearanceTitle} description={t.appearanceDescription}>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2 rounded-lg border border-gray-800 bg-gray-900/60 p-4">
                                <label htmlFor="bg-color" className="block text-sm text-gray-300">{t.background}</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        id="bg-color"
                                        type="color"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="h-12 w-12 cursor-pointer rounded border border-gray-600"
                                    />
                                    <span className="text-xs text-gray-400">{bgColor}</span>
                                </div>
                            </div>
                            <div className="space-y-2 rounded-lg border border-gray-800 bg-gray-900/60 p-4">
                                <label htmlFor="text-color" className="block text-sm text-gray-300">{t.textColor}</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        id="text-color"
                                        type="color"
                                        value={textColor}
                                        onChange={(e) => setTextColor(e.target.value)}
                                        className="h-12 w-12 cursor-pointer rounded border border-gray-600"
                                    />
                                    <span className="text-xs text-gray-400">{textColor}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                onClick={saveBiopage}
                                className="flex-1 rounded-md bg-blue-600 px-4 py-2 font-semibold transition hover:bg-blue-700"
                            >
                                {t.saveBiopage}
                            </button>
                            <Link
                                href={`/@${biopage.slug}`}
                                className="flex-1 rounded-md border border-gray-700 px-4 py-2 text-center text-sm text-gray-200 transition hover:border-blue-500 hover:text-white"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {t.viewBiopage}
                            </Link>
                        </div>
                    </SectionCard>
                </div>

                <div className="h-fit rounded-xl border border-gray-800/60 bg-gray-900/60 p-4 shadow-lg shadow-blue-900/10">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm text-gray-400">{t.preview}</span>
                        <div className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-300">
                            {t.selectLanguage}: {language.toUpperCase()}
                        </div>
                    </div>
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
        </div>
    )
}
