/* eslint-disable @next/next/no-img-element */
'use client'

import { ReactNode, useEffect, useMemo, useState } from 'react'
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
        appearance: 'Appearance',
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
        appearance: 'Apariencia',
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

const SectionCard = ({ title, actions, children, className = '' }: { title?: string; actions?: ReactNode; children: ReactNode; className?: string }) => (
    <section className={`rounded-lg border border-gray-800 bg-gray-900/50 p-4 shadow-lg ${className}`}>
        {(title || actions) && (
            <div className="mb-3 flex items-center justify-between gap-3">
                {title && <h3 className="text-lg font-semibold">{title}</h3>}
                {actions}
            </div>
        )}
        {children}
    </section>
);

const ColorInput = ({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (val: string) => void }) => (
    <div className="space-y-2">
        <label htmlFor={id} className="block text-sm text-gray-300">
            {label}
        </label>
        <input
            id={id}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-12 w-12 cursor-pointer rounded border border-gray-600 bg-transparent"
        />
    </div>
);

const LinksSelector = ({
    links,
    selected,
    onToggle,
    onLabelChange,
    placeholder,
    emptyLabel,
}: {
    links: LinkType[];
    selected: SelectedLink[];
    onToggle: (link: LinkType) => void;
    onLabelChange: (shortUrl: string, value: string) => void;
    placeholder: string;
    emptyLabel: string;
}) => (
    <div className="space-y-3">
        {links.length === 0 ? (
            <p className="text-gray-400">{emptyLabel}</p>
        ) : (
            links.map((link) => {
                const isSelected = selected.find((l) => l.shortUrl === link.shortUrl);
                return (
                    <div key={link.shortUrl} className="rounded-lg border border-gray-800 bg-gray-900/50 p-3">
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={!!isSelected} onChange={() => onToggle(link)} className="h-4 w-4 cursor-pointer" />
                            <span className="text-gray-200">{link.originalUrl}</span>
                        </label>
                        {isSelected && (
                            <input
                                type="text"
                                placeholder={placeholder}
                                value={isSelected.label}
                                onChange={(e) => onLabelChange(link.shortUrl, e.target.value)}
                                className="mt-2 w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                            />
                        )}
                    </div>
                );
            })
        )}
    </div>
);

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
                <SectionCard
                    className="grid grid-cols-[auto,1fr] items-center gap-4"
                    actions={isPremium && (
                        <button onClick={() => setModal(true)} className="text-sm text-blue-400 hover:text-blue-300">
                            {t.changeName}
                        </button>
                    )}
                >
                    <div
                        onClick={() => setAvatarModal(true)}
                        className="h-24 w-24 cursor-pointer overflow-hidden rounded-full ring-4 ring-blue-500 transition hover:ring-blue-400"
                    >
                        <img
                            src={biopage.avatarUrl || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"}
                            alt="avatar"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold">@{biopage.slug}</h2>
                        <span className={`inline-block rounded px-2 py-1 text-xs ${isPremium ? 'bg-yellow-600 text-black font-semibold' : 'bg-green-700'}`}>
                            {isPremium ? t.premiumBadge : t.freeBadge}
                        </span>
                        <p className="text-xs text-gray-400">{t.changeNote}</p>
                    </div>
                </SectionCard>

                <SectionCard title={t.linksTitle}>
                    <LinksSelector
                        links={links}
                        selected={selected}
                        onToggle={toggleSelect}
                        onLabelChange={updateLabel}
                        placeholder={t.displayName}
                        emptyLabel={t.noLinks}
                    />
                </SectionCard>

                <SectionCard title={t.appearance}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <ColorInput id="bg-color" label={t.background} value={bgColor} onChange={setBgColor} />
                        <ColorInput id="text-color" label={t.textColor} value={textColor} onChange={setTextColor} />
                    </div>
                </SectionCard>

                <SectionCard>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            onClick={saveBiopage}
                            className="flex-1 rounded-md bg-blue-600 px-4 py-2 transition hover:bg-blue-700"
                        >
                            {t.saveBiopage}
                        </button>
                        <Link
                            href={`/@${biopage.slug}`}
                            className="flex-1 rounded-md bg-green-600 px-4 py-2 text-center transition hover:bg-green-700"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {t.viewBiopage}
                        </Link>
                    </div>
                </SectionCard>
            </div>

            <SectionCard className="md:w-1/2 flex-1 h-fit flex flex-col items-center">
                <span className="text-sm text-gray-300">{t.preview}</span>
                <BiopagePreview
                    bgColor={bgColor}
                    textColor={textColor}
                    avatarUrl={biopage?.avatarUrl || ''}
                    slug={biopage?.slug || 'usuario'}
                    links={selected}
                    language={language}
                />
            </SectionCard>
        </div>
    )
}
