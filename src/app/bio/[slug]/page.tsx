/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useState } from 'react';
import QRButton from '@/components/QRButton';
import Spinner from '@/components/spinner';
import { SupportedLanguage } from '@/types/i18n';

interface Link {
    shortUrl: string;
    label: string;
}

interface BioPage {
    slug: string;
    links: Link[];
    textColor: string;
    backgroundColor: string;
    avatarUrl: string;
}

const translations: Record<SupportedLanguage, { [key: string]: string }> = {
    en: {
        loading: 'Loading your bio page...',
        error: 'This page does not exist or has been removed.',
        linksTitle: 'Available links',
        empty: 'There are no links to show yet.',
        footer: 'Fezlink - Your link shortener',
        language: 'Language',
        linkCount: 'links',
    },
    es: {
        loading: 'Cargando tu biopage...',
        error: 'Esta página no existe o ha sido eliminada.',
        linksTitle: 'Enlaces disponibles',
        empty: 'No hay links para mostrar.',
        footer: 'Fezlink - Tu acortador de links',
        language: 'Idioma',
        linkCount: 'enlaces',
    },
};

const getSafeUrl = (url: string) => (url.startsWith('http') ? url : `https://${url}`);

const BioHeader = ({ avatarUrl, slug, textColor }: { avatarUrl?: string; slug: string; textColor: string }) => (
    <div className="flex flex-col items-center gap-4">
        <div className="relative h-32 w-32 overflow-hidden rounded-full shadow-xl shadow-black/20">
            <img
                src={avatarUrl || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'}
                alt="Avatar"
                className="h-full w-full object-cover"
                style={{ border: `4px solid ${textColor}` }}
            />
        </div>
        <h1 className="text-3xl font-extrabold drop-shadow-sm">@{slug}</h1>
    </div>
);

const LinkCard = ({ link, textColor, backgroundColor, slug }: { link: Link; textColor: string; backgroundColor: string; slug: string }) => (
    <li className="group list-none rounded-xl bg-white/10 p-[1px] backdrop-blur">
        <div className="flex items-center gap-3 rounded-xl bg-gray-900/40 p-3 transition hover:bg-gray-900/60">
            <a
                href={getSafeUrl(link.shortUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-left text-lg font-semibold"
                style={{ color: textColor }}
            >
                {link.label || link.shortUrl}
            </a>
            <div className="shrink-0">
                <QRButton url={`${process.env.BASE_URL}/${slug}`} backgroundColor={textColor} textColor={backgroundColor} />
            </div>
        </div>
    </li>
);

const LanguageToggle = ({ language, onChange }: { language: SupportedLanguage; onChange: (lang: SupportedLanguage) => void }) => (
    <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs text-gray-200">
        <span className="uppercase tracking-wide text-gray-400">{translations[language].language}</span>
        {(['en', 'es'] as SupportedLanguage[]).map((lang) => (
            <button
                key={lang}
                onClick={() => onChange(lang)}
                className={`rounded-full px-3 py-1 font-semibold transition ${
                    language === lang ? 'bg-white/90 text-black shadow-md shadow-white/40' : 'text-gray-200 hover:bg-white/10'
                }`}
            >
                {lang.toUpperCase()}
            </button>
        ))}
    </div>
);

export default function BioPage({ params, searchParams }: { params: { slug: string }; searchParams?: { lang?: string } }) {
    const [bioPage, setBioPage] = useState<BioPage | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const initialLanguage: SupportedLanguage = useMemo(() => (searchParams?.lang === 'es' ? 'es' : 'en'), [searchParams?.lang]);
    const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);
    const t = translations[language];

    useEffect(() => {
        if (!searchParams?.lang && typeof window !== 'undefined') {
            const browserLang = window.navigator.language.startsWith('es') ? 'es' : 'en';
            setLanguage(browserLang);
        }
    }, [searchParams?.lang]);

    useEffect(() => {
        const fetchFunc = async () => {
            try {
                const res = await fetch(`/api/biopage/${params.slug}`);
                if (!res.ok) throw new Error('Not found');
                const data = await res.json();
                setBioPage(data.biopage);
            } catch (err) {
                setError(t.error);
                console.error('Error fetching biopage:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFunc();
    }, [params.slug, t.error]);

    if (isLoading)
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-gray-900 to-black text-white">
                <h1 className="text-lg font-semibold">{t.loading}</h1>
                <Spinner color="white" />
            </div>
        );
    if (error) return <div className="p-6 text-center text-red-400">{error}</div>;
    if (!bioPage) return null;

    return (
        <main
            className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10 text-center"
            style={{ backgroundColor: bioPage.backgroundColor, color: bioPage.textColor }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" aria-hidden></div>
            <div className="relative z-10 flex w-full max-w-3xl flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs text-gray-200">
                        {bioPage.links.length} {t.linkCount}
                    </div>
                    <LanguageToggle language={language} onChange={setLanguage} />
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/30 p-6 shadow-2xl shadow-black/20 backdrop-blur">
                    <BioHeader avatarUrl={bioPage.avatarUrl} slug={bioPage.slug} textColor={bioPage.textColor} />

                    <section className="mt-8 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-left text-2xl font-semibold">{t.linksTitle}</h2>
                            <div className="h-[2px] flex-1 bg-gradient-to-r from-white/40 via-white/10 to-transparent" aria-hidden></div>
                        </div>
                        {bioPage.links.length === 0 ? (
                            <p className="rounded-xl bg-white/5 p-4 text-gray-300 shadow-inner">{t.empty}</p>
                        ) : (
                            <ul className="space-y-3">
                                {bioPage.links.map((link) => (
                                    <LinkCard key={link.shortUrl} link={link} slug={bioPage.slug} textColor={bioPage.textColor} backgroundColor={bioPage.backgroundColor} />
                                ))}
                            </ul>
                        )}
                    </section>
                </div>

                <footer className="text-sm text-gray-200">
                    © {new Date().getFullYear()} {t.footer}
                </footer>
            </div>
        </main>
    );
}
