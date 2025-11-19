'use client';

import React, { useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { BarChart3, Flame, Home, Link as LinkIcon, Loader2, Palette } from 'lucide-react';
import Spinner from '@/components/spinner';
import Link from 'next/link';
import useLinks from '@/hooks/useLinks';
import LinkManager from '@/components/link-manager';
import Stats from '@/components/stats';
import BiopageEditor from './biopageeditor';
import PremiumFeatures from '@/components/premiumfeatures';
import { SupportedLanguage } from '@/types/i18n';

interface Section {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    content: React.ReactNode;
}

const translations: Record<SupportedLanguage, { [key: string]: string }> = {
    en: {
        welcome: 'Welcome back',
        dashboardTitle: 'FezLink Dashboard',
        description: 'Manage your links, biopage, and metrics from a single view.',
        home: 'Back to home',
        linksLabel: 'Links',
        linksDescription: 'Create and manage your short links with quick actions',
        statsLabel: 'Statistics',
        statsDescription: 'Monitor performance and reach for every link',
        biopageLabel: 'BioPage',
        biopageDescription: 'Customize your public profile and color palette',
        subscriptionLabel: 'Manage subscription',
        subscriptionDescription: 'Keep your premium benefits up to date and adjust your plan',
        loading: 'Loading...',
        viewing: 'Viewing',
        language: 'Language',
    },
    es: {
        welcome: 'Bienvenido de vuelta',
        dashboardTitle: 'FezLink Dashboard',
        description: 'Administra tus enlaces, biopage y métricas desde una única vista.',
        home: 'Volver al inicio',
        linksLabel: 'Links',
        linksDescription: 'Crea y gestiona tus enlaces cortos con acciones rápidas',
        statsLabel: 'Estadísticas',
        statsDescription: 'Monitorea el rendimiento y el alcance de cada enlace',
        biopageLabel: 'BioPage',
        biopageDescription: 'Personaliza tu perfil público y la paleta de colores',
        subscriptionLabel: 'Gestionar suscripción',
        subscriptionDescription: 'Mantén tus beneficios premium al día y ajusta tu plan',
        loading: 'Cargando...',
        viewing: 'Viendo',
        language: 'Idioma',
    },
};

const DashboardPage: React.FC = () => {
    const { isLoaded, user } = useUser();
    const linkState = useLinks();
    const [language, setLanguage] = useState<SupportedLanguage>('en');
    const t = translations[language];
    const sections: Section[] = useMemo(
        () => [
            {
                id: 'links',
                label: t.linksLabel,
                description: t.linksDescription,
                icon: <LinkIcon size={18} />,
                content: <LinkManager linkState={linkState} language={language} />,
            },
            {
                id: 'stats',
                label: t.statsLabel,
                description: t.statsDescription,
                icon: <BarChart3 size={18} />,
                content: <Stats links={linkState.links} language={language} />,
            },
            {
                id: 'biopage',
                label: t.biopageLabel,
                description: t.biopageDescription,
                icon: <Palette size={18} />,
                content: <BiopageEditor language={language} />,
            },
            {
                id: 'premium',
                label: t.subscriptionLabel,
                description: t.subscriptionDescription,
                icon: <Flame size={18} color="#ff5900" />,
                content: (
                    <div className="flex flex-wrap justify-center gap-4">
                        <PremiumFeatures language={language} time={"mensual"} priceId={"pri_01jwryd6rgxfdh50rknhcqh1aq"} />
                        <PremiumFeatures language={language} time={"anual"} priceId={"pri_01jwryfkyzp3jrbj7xw8hjp585"} />
                    </div>
                ),
            },
        ],
        [language, linkState, t]
    );

    const [activeSection, setActiveSection] = useState<string>(sections[0]?.id ?? 'links');
    const currentSection = sections.find((section) => section.id === activeSection) ?? sections[0];

    if (!isLoaded) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-gray-900">
                <span className="text-lg text-white">{t.loading}</span>
                <Spinner color="white" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-[#0b1224] to-black px-4 pb-16 text-white">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pt-10">
                <div className="flex flex-col gap-4 rounded-2xl border border-gray-800/80 bg-gray-900/60 p-6 shadow-2xl shadow-blue-900/20 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <p className="text-sm text-gray-400">{t.welcome}</p>
                        <h1 className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-4xl font-extrabold text-transparent">
                            {user?.firstName ? `${user.firstName} ${user.lastName ?? ''}` : t.dashboardTitle}
                        </h1>
                        <p className="mt-1 text-gray-400">{t.description}</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-full border border-gray-700 px-2 py-1 text-xs text-gray-200 sm:w-auto sm:px-3">
                            <span className="px-2 text-gray-400">{t.language}</span>
                            <div className="flex flex-wrap gap-1">
                                {(['en', 'es'] as SupportedLanguage[]).map((lng) => (
                                    <button
                                        key={lng}
                                        onClick={() => setLanguage(lng)}
                                        className={`rounded-full px-3 py-1 font-semibold transition ${
                                            language === lng
                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/40'
                                                : 'text-gray-300 hover:bg-gray-800'
                                        }`}
                                        aria-label={`Switch dashboard language to ${lng === 'en' ? 'English' : 'Spanish'}`}
                                    >
                                        {lng.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Link
                            href="/"
                            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-700 px-4 py-2 text-sm text-gray-200 transition hover:border-blue-500 hover:text-white sm:w-auto"
                        >
                            <Home size={16} /> {t.home}
                        </Link>
                    </div>
                </div>

                <div className="grid items-start gap-4 md:grid-cols-[minmax(0,260px),1fr] lg:grid-cols-[minmax(0,280px),1fr]">
                    <aside className="top-6 h-fit rounded-xl border border-gray-800/80 bg-gray-900/60 p-3 shadow-xl shadow-blue-900/10 md:self-start">
                        <ul className="flex flex-row gap-2 overflow-x-auto pb-2 md:flex-col md:pb-0">
                            {sections.map((section) => (
                                <li key={section.id} className="flex-1 min-w-[160px] md:min-w-0 md:flex-none">
                                    <button
                                        onClick={() => setActiveSection(section.id)}
                                        className={`flex w-full min-w-0 items-start gap-3 rounded-lg border px-3 py-3 text-left transition md:flex-row ${
                                            activeSection === section.id
                                                ? 'border-blue-500/70 bg-blue-500/10 text-white shadow-md shadow-blue-500/20'
                                                : 'border-transparent bg-gray-800/60 text-gray-300 hover:border-gray-600 hover:text-white'
                                        }`}
                                    >
                                        <span className="mt-1 text-blue-300">{section.icon}</span>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <p className="text-sm font-semibold leading-tight">{section.label}</p>
                                            <p className="text-xs text-gray-400 leading-snug">{section.description}</p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    <main className="min-w-0 overflow-hidden rounded-xl border border-gray-800/80 bg-gray-900/70 p-4 shadow-2xl">
                        {!currentSection ? (
                            <div className="flex min-h-[40vh] items-center justify-center text-gray-400">
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                        ) : (
                            <div className="min-h-[60vh] space-y-4">{currentSection.content}</div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
