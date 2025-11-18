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

interface Section {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    content: React.ReactNode;
}

const DashboardPage: React.FC = () => {
    const { isLoaded, user } = useUser();
    const linkState = useLinks();
    const sections: Section[] = useMemo(
        () => [
            {
                id: 'links',
                label: 'Links',
                description: 'Crea y gestiona tus enlaces cortos con acciones rápidas',
                icon: <LinkIcon size={18} />,
                content: <LinkManager linkState={linkState} />,
            },
            {
                id: 'stats',
                label: 'Estadísticas',
                description: 'Monitorea el rendimiento y el alcance de cada enlace',
                icon: <BarChart3 size={18} />,
                content: <Stats links={linkState.links} />,
            },
            {
                id: 'biopage',
                label: 'BioPage',
                description: 'Personaliza tu perfil público y la paleta de colores',
                icon: <Palette size={18} />,
                content: <BiopageEditor />,
            },
            {
                id: 'premium',
                label: 'Premium',
                description: 'Desbloquea funciones avanzadas y más capacidades',
                icon: <Flame size={18} color="#ff5900" />,
                content: (
                    <div className="flex flex-wrap justify-center gap-4">
                        <PremiumFeatures time={"mensual"} priceId={"pri_01jwryd6rgxfdh50rknhcqh1aq"} />
                        <PremiumFeatures time={"anual"} priceId={"pri_01jwryfkyzp3jrbj7xw8hjp585"} />
                    </div>
                ),
            },
        ],
        [linkState]
    );

    const [activeSection, setActiveSection] = useState<string>(sections[0]?.id ?? 'links');
    const currentSection = sections.find((section) => section.id === activeSection) ?? sections[0];

    if (!isLoaded) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-gray-900">
                <span className="text-lg text-white">Cargando...</span>
                <Spinner color="white" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-[#0b1224] to-black px-4 pb-16 text-white">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pt-10">
                <div className="flex flex-col gap-3 rounded-2xl border border-gray-800/80 bg-gray-900/60 p-6 shadow-2xl shadow-blue-900/20 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm text-gray-400">Bienvenido de vuelta</p>
                        <h1 className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-4xl font-extrabold text-transparent">
                            {user?.firstName ? `${user.firstName} ${user.lastName ?? ''}` : 'FezLink Dashboard'}
                        </h1>
                        <p className="mt-1 text-gray-400">Administra tus enlaces, biopage y métricas desde una única vista.</p>
                    </div>
                    <Link
                        href="/"
                        className="flex items-center gap-2 rounded-full border border-gray-700 px-4 py-2 text-sm text-gray-200 transition hover:border-blue-500 hover:text-white"
                    >
                        <Home size={16} /> Volver al inicio
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-[260px,1fr]">
                    <aside className="sticky top-6 h-fit rounded-xl border border-gray-800/80 bg-gray-900/60 p-3 shadow-xl shadow-blue-900/10">
                        <ul className="flex flex-row gap-2 overflow-auto pb-2 md:flex-col md:pb-0">
                            {sections.map((section) => (
                                <li key={section.id} className="flex-1 md:flex-none">
                                    <button
                                        onClick={() => setActiveSection(section.id)}
                                        className={`flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition md:flex-row ${
                                            activeSection === section.id
                                                ? 'border-blue-500/70 bg-blue-500/10 text-white shadow-md shadow-blue-500/20'
                                                : 'border-transparent bg-gray-800/60 text-gray-300 hover:border-gray-600 hover:text-white'
                                        }`}
                                    >
                                        <span className="mt-1 text-blue-300">{section.icon}</span>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold">{section.label}</p>
                                            <p className="text-xs text-gray-400">{section.description}</p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    <main className="rounded-xl border border-gray-800/80 bg-gray-900/70 p-4 shadow-2xl">
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
