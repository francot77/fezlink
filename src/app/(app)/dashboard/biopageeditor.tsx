/* eslint-disable @next/next/no-img-element */
'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSession } from 'next-auth/react';
import Link from 'next/link'
import Button from '@/components/button'
import { BiopageType, LinkType, SelectedLink } from '@/types/globals'
import { toast } from 'sonner'
import { UploadButton } from '@/utils/uploadthings'
import CustomModal from '@/components/Modalv2'
import BiopagePreview from '@/components/biopagepreview'
import { SupportedLanguage } from '@/types/i18n'
import { User, Link as LinkIcon, Palette, Eye, Check, X, Upload, Sparkles, Crown, ExternalLink, Save } from 'lucide-react'

const translations: Record<SupportedLanguage, { [key: string]: string }> = {
    en: {
        loading: 'Loading...',
        unauthorized: 'Unauthorized',
        noBiopage: 'No biopage yet',
        wantGenerate: 'Create your personalized biopage to share all your links in one place',
        generate: 'Create Biopage',
        changeUsername: 'Change your username',
        save: 'Save',
        usernamePlaceholder: 'Insert a new username',
        changeNote: 'You can change it every 3 days, choose wisely.',
        avatarQuestion: 'Change avatar',
        avatarSuccess: 'Avatar updated successfully',
        avatarError: 'Error!',
        close: 'Close',
        premiumBadge: 'Premium',
        freeBadge: 'Free',
        changeName: 'Change username',
        linksTitle: 'Visible links',
        linksDescription: 'Select which links appear on your biopage and customize their labels.',
        noLinks: 'No links available',
        displayName: 'Display name',
        background: 'Background',
        appearanceTitle: 'Style & appearance',
        appearanceDescription: 'Customize colors and gradients to match your brand.',
        textColor: 'Text color',
        gradients: 'Gradient themes',
        customColor: 'Custom color',
        colorHelp: 'Use hex colors or CSS values',
        avatarLabel: 'Avatar URL',
        saveBiopage: 'Save changes',
        viewBiopage: 'View biopage',
        preview: 'Live preview',
        created: 'Biopage created successfully',
        createError: 'Error creating biopage',
        saved: 'Saved successfully',
        saveError: 'Error saving biopage',
        updateError: 'There is no biopage to update',
        slugSaved: 'Username updated',
        slugErrorPrefix: 'Error:',
        avatarPrompt: 'Upload a new avatar',
        avatarUploadSuccess: 'Avatar updated successfully',
        profileTitle: 'Profile',
        profileDescription: 'Manage your public identity and avatar.',
        premiumHint: 'Premium users can customize their username',
        cancel: 'Cancel',
        selectLanguage: 'Language',
        descriptionLabel: 'Bio description',
        descriptionPlaceholder: 'Tell people who you are or what you do...',
    },
    es: {
        loading: 'Cargando...',
        unauthorized: 'No autorizado',
        noBiopage: 'Aún no tienes biopage',
        wantGenerate: 'Crea tu biopage personalizada para compartir todos tus enlaces en un solo lugar',
        generate: 'Crear Biopage',
        changeUsername: 'Cambiar nombre de usuario',
        save: 'Guardar',
        usernamePlaceholder: 'Nuevo nombre de usuario',
        changeNote: 'Puedes cambiarlo cada 3 días, elige bien.',
        avatarQuestion: 'Cambiar avatar',
        avatarSuccess: 'Avatar actualizado',
        avatarError: '¡Error!',
        close: 'Cerrar',
        premiumBadge: 'Premium',
        freeBadge: 'Gratis',
        changeName: 'Cambiar usuario',
        linksTitle: 'Enlaces visibles',
        linksDescription: 'Selecciona qué enlaces aparecen en tu biopage y personaliza sus etiquetas.',
        noLinks: 'No hay enlaces',
        displayName: 'Nombre para mostrar',
        background: 'Fondo',
        appearanceTitle: 'Estilo y apariencia',
        appearanceDescription: 'Personaliza colores y degradados para tu marca.',
        textColor: 'Color de texto',
        gradients: 'Temas degradados',
        customColor: 'Color personalizado',
        colorHelp: 'Usa colores hex o valores CSS',
        avatarLabel: 'URL del avatar',
        saveBiopage: 'Guardar cambios',
        viewBiopage: 'Ver biopage',
        preview: 'Vista previa',
        created: 'Biopage creada exitosamente',
        createError: 'Error al crear biopage',
        saved: 'Guardado exitosamente',
        saveError: 'Error al guardar',
        updateError: 'No hay biopage para actualizar',
        slugSaved: 'Usuario actualizado',
        slugErrorPrefix: 'Error:',
        avatarPrompt: 'Sube un nuevo avatar',
        avatarUploadSuccess: 'Avatar actualizado',
        profileTitle: 'Perfil',
        profileDescription: 'Administra tu identidad pública y avatar.',
        premiumHint: 'Los usuarios Premium pueden personalizar su usuario',
        cancel: 'Cancelar',
        selectLanguage: 'Idioma',
        descriptionLabel: 'Descripción de bio',
        descriptionPlaceholder: 'Cuéntale a la gente quién eres o qué haces...',
    },
}

const defaultAvatar =
    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'

const gradientPresets = [
    { label: 'Aurora', value: 'linear-gradient(135deg, #a855f7 0%, #22d3ee 50%, #0ea5e9 100%)', colors: ['from-purple-500', 'to-cyan-500'] },
    { label: 'Sunset', value: 'linear-gradient(135deg, #ff6b6b 0%, #f8c146 50%, #f97316 100%)', colors: ['from-red-500', 'to-orange-500'] },
    { label: 'Forest', value: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #0f766e 100%)', colors: ['from-green-500', 'to-teal-600'] },
    { label: 'Midnight', value: 'linear-gradient(135deg, #0ea5e9 0%, #312e81 50%, #111827 100%)', colors: ['from-blue-500', 'to-gray-900'] },
    { label: 'Candy', value: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #6366f1 100%)', colors: ['from-pink-500', 'to-indigo-500'] },
    { label: 'Tropical', value: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 35%, #10b981 100%)', colors: ['from-amber-400', 'to-emerald-500'] },
    { label: 'Cosmic', value: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 45%, #ec4899 100%)', colors: ['from-indigo-600', 'to-pink-500'] },
    { label: 'Lagoon', value: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 50%, #22c55e 100%)', colors: ['from-cyan-500', 'to-green-500'] },
]

const SectionCard = ({ title, description, icon: Icon, children }: { title: string, description?: string, icon?: React.ElementType, children: ReactNode }) => (
    <section className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl transition-all duration-300 hover:border-white/20">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative p-6 space-y-4">
            <header className="space-y-2">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 ring-1 ring-white/10">
                            <Icon size={20} className="text-emerald-400" />
                        </div>
                    )}
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                </div>
                {description && <p className="text-sm text-gray-400">{description}</p>}
            </header>
            <div className="space-y-4">{children}</div>
        </div>
    </section>
)

export default function BiopageEditor({ language = 'en' }: { language?: SupportedLanguage }) {
    const t = useMemo(() => translations[language], [language])
    //migrated from clerk to authjs
    const { data: session } = useSession();
    const user = session?.user;

    const [links, setLinks] = useState<LinkType[]>([])
    const [selected, setSelected] = useState<SelectedLink[]>([])
    const [bgColor, setBgColor] = useState('#000000')
    const [textColor, setTextColor] = useState('#ffffff')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [description, setDescription] = useState('')
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
                setAvatarUrl(data.biopage.avatarUrl || '')
                setDescription(data.biopage.description || '')
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
        const slug = link.slug ?? link.shortId;
        if (!slug) return;
        setSelected((prev) =>
            prev.some((l) => l.shortId === slug)
                ? prev.filter((l) => l.shortId !== slug)
                : [...prev, { shortId: slug, slug, shortUrl: link.shortUrl, label: '' }]
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
            setAvatarUrl(data.biopage.avatarUrl || '')
            setDescription(data.biopage.description || '')
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
                    avatarUrl: avatarUrl || '',
                    description,
                }),
            })
            const data = await res.json()
            if (res.ok) {
                setBiopage(data.biopage)
                setAvatarUrl(data.biopage.avatarUrl || avatarUrl)
                setDescription(data.biopage.description || description)
                toast.success(t.saved, { richColors: true, position: "top-center" })
            } else {
                toast.error(`${t.slugErrorPrefix} ${data.error || t.saveError}`, { richColors: true, position: "top-center" })
            }
        } catch (error) {
            toast.error(`${t.saveError}: ${error}`, { richColors: true, position: "top-center" })
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 to-black/60 px-6 py-12 backdrop-blur-xl">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                <span className="text-gray-300">{t.loading}</span>
            </div>
        )
    }

    if (!user) return <div className="p-6 text-red-300">{t.unauthorized}</div>

    if (!biopage)
        return (
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" />
                <div className="relative flex flex-col items-center justify-center gap-6 p-12 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 ring-1 ring-white/10">
                        <Sparkles size={40} className="text-emerald-400" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-white">{t.noBiopage}</h1>
                        <p className="text-gray-400 max-w-md">{t.wantGenerate}</p>
                    </div>
                    <Button
                        title={t.generate}
                        onClick={createBiopage}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3 font-semibold shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/40"
                    >
                        <Sparkles size={18} />
                        {t.generate}
                    </Button>
                </div>
            </div>
        )

    return (
        <div className="space-y-6 text-white">
            {modal && (
                <CustomModal
                    title={t.changeUsername}
                    onClose={() => setModal(false)}
                    onAccept={handleChangeSlug}
                    acceptText={t.save}
                >
                    <div className='flex gap-3 flex-col'>
                        <input
                            className='w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white backdrop-blur-sm transition focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20'
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
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm'>
                    <div className='relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-900/95 backdrop-blur-xl shadow-2xl'>
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" />
                        <div className='relative p-6 space-y-6'>
                            <div className='flex flex-col items-center gap-4 text-center'>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 ring-1 ring-white/10">
                                    <Upload size={24} className="text-emerald-400" />
                                </div>
                                <h1 className="text-xl font-semibold">{t.avatarPrompt}</h1>
                                <div className="relative w-32 h-32 rounded-2xl overflow-hidden ring-2 ring-emerald-400/50 shadow-xl shadow-emerald-500/20">
                                    <img
                                        src={avatarUrl || defaultAvatar}
                                        alt="avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <UploadButton
                                endpoint="imageUploader"
                                onClientUploadComplete={(res) => {
                                    const uploadedUrl = res?.[0]?.url
                                    if (uploadedUrl) {
                                        setAvatarUrl(uploadedUrl)
                                        setBiopage((prev) => prev ? { ...prev, avatarUrl: uploadedUrl } : prev)
                                    }
                                    toast.success(t.avatarUploadSuccess, { richColors: true, position: "top-center" });
                                }}
                                onUploadError={(error: Error) => {
                                    toast.error(`${t.avatarError} ${error.message}`, { richColors: true, position: "top-center" });
                                }}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setAvatarModal(false)}
                                    className='flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/10'
                                >
                                    <X size={16} />
                                    {t.cancel}
                                </button>
                                <Button
                                    title={t.close}
                                    onClick={() => setAvatarModal(false)}
                                    className='flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-3 font-semibold transition-all duration-300 hover:scale-105'
                                >
                                    <Check size={16} />
                                    {t.close}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
                <div className="space-y-6">
                    <SectionCard title={t.profileTitle} description={t.profileDescription} icon={User}>
                        <div className="grid gap-6 md:grid-cols-[auto,1fr] md:items-start">
                            <button
                                type="button"
                                onClick={() => setAvatarModal(true)}
                                className="group relative w-32 h-32 rounded-2xl overflow-hidden ring-2 ring-emerald-400/50 shadow-xl shadow-emerald-500/20 transition-all duration-300 hover:scale-105 hover:ring-emerald-400"
                            >
                                <img src={avatarUrl || defaultAvatar} alt="avatar" className="w-full h-full object-cover" />
                                <span className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    <Upload size={24} className="text-white" />
                                </span>
                            </button>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl font-bold text-white">@{biopage.slug}</h2>
                                        {isPremium ? (
                                            <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 px-3 py-1 ring-1 ring-yellow-500/30">
                                                <Crown size={14} className="text-yellow-400" />
                                                <span className="text-xs font-semibold text-yellow-300">{t.premiumBadge}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 ring-1 ring-emerald-500/30">
                                                <span className="text-xs font-semibold text-emerald-300">{t.freeBadge}</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400">{t.premiumHint}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {isPremium && (
                                        <button
                                            onClick={() => setModal(true)}
                                            className="flex items-center gap-2 rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
                                        >
                                            <User size={16} />
                                            {t.changeName}
                                        </button>
                                    )}
                                    <Link
                                        href={`/@${biopage.slug}`}
                                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink size={16} />
                                        {t.viewBiopage}
                                    </Link>
                                </div>
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300" htmlFor="description-textarea">{t.descriptionLabel}</label>
                                        <textarea
                                            id="description-textarea"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder={t.descriptionPlaceholder}
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur-sm transition focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[96px] resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300" htmlFor="avatar-url">{t.avatarLabel}</label>
                                        <input
                                            id="avatar-url"
                                            type="url"
                                            value={avatarUrl}
                                            onChange={(e) => setAvatarUrl(e.target.value)}
                                            placeholder={defaultAvatar}
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur-sm transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title={t.linksTitle} description={t.linksDescription} icon={LinkIcon}>
                        {links.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">{t.noLinks}</p>
                        ) : (
                            <div className="space-y-3">
                                {links.map((link) => {
                                    const isSelected = selected.find((l) => l.shortUrl === link.shortUrl)
                                    return (
                                        <div key={link.shortUrl} className={`rounded-xl border transition-all duration-300 ${isSelected
                                            ? 'border-emerald-400/50 bg-emerald-500/10'
                                            : 'border-white/10 bg-white/5 hover:border-white/20'
                                            }`}>
                                            <label className="flex items-start gap-3 p-4 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={!!isSelected}
                                                    onChange={() => toggleSelect(link)}
                                                    className="mt-1 h-5 w-5 cursor-pointer rounded border-gray-600 bg-gray-800 text-emerald-500 transition focus:ring-emerald-500"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white break-all">{link.destinationUrl}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{link.shortUrl}</p>
                                                </div>
                                            </label>
                                            {isSelected && (
                                                <div className="px-4 pb-4">
                                                    <input
                                                        type="text"
                                                        placeholder={t.displayName}
                                                        value={isSelected.label}
                                                        onChange={(e) => updateLabel(link.shortUrl, e.target.value)}
                                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white backdrop-blur-sm transition focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard title={t.appearanceTitle} description={t.appearanceDescription} icon={Palette}>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-gray-300">{t.gradients}</p>
                                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                                    {gradientPresets.map((preset) => (
                                        <button
                                            key={preset.label}
                                            type="button"
                                            onClick={() => setBgColor(preset.value)}
                                            className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 hover:scale-105 ${bgColor === preset.value
                                                ? 'ring-2 ring-emerald-400 shadow-xl shadow-emerald-500/20'
                                                : 'ring-1 ring-white/10 hover:ring-white/20'
                                                }`}
                                            style={{ backgroundImage: preset.value }}
                                        >
                                            <div className="relative z-10">
                                                <span className="block text-sm font-semibold text-white drop-shadow-lg">{preset.label}</span>
                                                {bgColor === preset.value && (
                                                    <Check size={16} className="absolute top-0 right-0 text-white drop-shadow-lg" />
                                                )}
                                            </div>
                                            <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                                    <label className="block text-sm font-medium text-gray-300">{t.customColor}</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={bgColor.startsWith('#') ? bgColor : '#000000'}
                                            onChange={(e) => setBgColor(e.target.value)}
                                            className="h-12 w-12 cursor-pointer rounded-lg border border-white/20"
                                        />
                                        <input
                                            type="text"
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white backdrop-blur-sm transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                            placeholder="#000000"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400">{t.colorHelp}</p>
                                </div>

                                <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                                    <label className="block text-sm font-medium text-gray-300">{t.textColor}</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={textColor.startsWith('#') ? textColor : '#ffffff'}
                                            onChange={(e) => setTextColor(e.target.value)}
                                            className="h-12 w-12 cursor-pointer rounded-lg border border-white/20"
                                        />
                                        <input
                                            type="text"
                                            value={textColor}
                                            onChange={(e) => setTextColor(e.target.value)}
                                            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white backdrop-blur-sm transition focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                            placeholder="#ffffff"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400">{t.colorHelp}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                onClick={saveBiopage}
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/40"
                            >
                                <Save size={18} />
                                {t.saveBiopage}
                            </button>
                            <Link
                                href={`/@${biopage.slug}`}
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-gray-300 transition hover:bg-white/10"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink size={18} />
                                {t.viewBiopage}
                            </Link>
                        </div>
                    </SectionCard>
                </div>

                <div className="sticky top-6 h-fit">
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5" />
                        <div className="relative p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Eye size={18} className="text-purple-400" />
                                    <span className="text-sm font-medium text-gray-300">{t.preview}</span>
                                </div>
                                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
                                    {language.toUpperCase()}
                                </div>
                            </div>
                            <BiopagePreview
                                bgColor={bgColor}
                                textColor={textColor}
                                avatarUrl={avatarUrl || ''}
                                slug={biopage?.slug || 'usuario'}
                                links={selected}
                                description={description}
                                language={language}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}