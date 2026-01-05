'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { BarChart3, Flame, Home, Link as LinkIcon, Loader2, Palette, Rocket, Menu, X, ChevronRight, Globe, LogOut } from 'lucide-react';
import Spinner from '@/components/spinner';
import Link from 'next/link';
import useLinks from '@/hooks/useLinks';
import LinkManager from '@/components/link-manager';
import Stats from '@/components/stats';
import BiopageEditor from './biopageeditor';
import PremiumFeatures from '@/components/premiumfeatures';
import { SupportedLanguage } from '@/types/i18n';
import { signOut, useSession } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';
import InsightsDashboard from '@/components/insights/InsightsDashboard';
import CustomModal from '@/components/Modalv2';

interface Section {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    content: React.ReactNode;
}

const translations: Record<SupportedLanguage, { [key: string]: string }> = {
    en: {
        logout: 'Logout',
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
        insights: 'Insights',
        insightsDescription: 'Discover what makes you take off',
        menu: 'Menu',
        close: 'Close',
    },
    es: {
        logout: 'Cerrar sesión',
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
        insights: 'Insights',
        insightsDescription: 'Conoce que te hace despegar',
        menu: 'Menú',
        close: 'Cerrar',
    },
};

const DashboardPage: React.FC = () => {
    const { data: session } = useSession();
    const user = session?.user;
    const { isLoaded } = useAuth();
    const linkState = useLinks();
    const [language, setLanguage] = useState<SupportedLanguage>('es');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [modalLogout, setModalLogout] = useState(false)
    const [isTransitioning, setIsTransitioning] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLElement>(null);

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
                id: 'insights',
                label: t.insights,
                description: t.insightsDescription,
                icon: <Rocket size={18} />,
                content: <InsightsDashboard />,
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

    // Smooth scroll to content when section changes
    const handleSectionChange = (sectionId: string) => {
        if (sectionId === activeSection) return;

        setIsTransitioning(true);
        setActiveSection(sectionId);
        setIsMobileSidebarOpen(false);

        // Scroll to main content on mobile
        if (window.innerWidth < 768 && mainRef.current) {
            setTimeout(() => {
                mainRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
            }, 100);
        }

        // Reset transition state after animation
        setTimeout(() => {
            setIsTransitioning(false);
        }, 300);
    };

    const handleLogout = () => {
        setModalLogout(false)
        signOut()
    }

    // Close mobile sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isMobileSidebarOpen && !target.closest('.mobile-sidebar') && !target.closest('.menu-button')) {
                setIsMobileSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileSidebarOpen]);

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        if (isMobileSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileSidebarOpen]);

    if (!isLoaded) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-gray-900">
                <span className="text-lg text-white">{t.loading}</span>
                <Spinner color="white" />
            </div>
        );
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-gray-900 via-[#0b1224] to-black px-4 pb-16 text-white">
            {modalLogout && <CustomModal title='Cerrar sesion?' onClose={() => { setModalLogout(false) }} onAccept={handleLogout} >
                Estas seguro que deseas cerrar sesion?
            </CustomModal>}
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:gap-6 pt-4 sm:pt-10">
                {/* Header - Mobile Version (Compact) */}
                <div className="md:hidden relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl pt-7 p-4 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
                    <div className="relative space-y-3">
                        {/* Top row: Name + Language selector */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-500 mb-0.5">{t.welcome}</p>
                                <h1 className="bg-gradient-to-r from-green-700 via-green-400 to-white bg-clip-text text-xl font-extrabold text-transparent truncate">
                                    {user?.name ? `${user.name}` : t.dashboardTitle}
                                </h1>
                            </div>

                            {/* Compact language selector */}
                            <div className="flex shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-1">
                                {(['en', 'es'] as SupportedLanguage[]).map((lng) => (
                                    <button
                                        key={lng}
                                        onClick={() => setLanguage(lng)}
                                        className={`min-w-[40px] rounded-md px-2 py-1 text-xs font-bold transition-all duration-200 ${language === lng
                                            ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md shadow-blue-500/30'
                                            : 'text-gray-400 hover:text-white'
                                            }`}
                                        aria-label={`Switch to ${lng === 'en' ? 'English' : 'Spanish'}`}
                                    >
                                        {lng.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Bottom row: Home button */}
                        <Link
                            href="/"
                            className="flex min-h-[40px] w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-2 text-xs font-semibold text-gray-300 transition-all duration-200 hover:border-blue-400/50 hover:bg-white/10 hover:text-white active:scale-95"
                        >
                            <Home size={14} /> {t.home}
                        </Link>
                    </div>
                </div>

                {/* Header - Desktop Version (Original) */}
                <div className="hidden md:block relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl p-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
                    <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-400">{t.welcome}</p>
                            <h1 className="bg-gradient-to-r from-green-700 via-green-400 to-white bg-clip-text text-3xl sm:text-4xl font-extrabold text-transparent">
                                {user?.name ? `${user.name}` : t.dashboardTitle}
                            </h1>
                            <p className="text-sm text-gray-400">{t.description}</p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-2 text-xs">
                                <Globe size={14} className="text-gray-400" />
                                <span className="text-gray-400">{t.language}:</span>
                                <div className="flex gap-1">
                                    {(['en', 'es'] as SupportedLanguage[]).map((lng) => (
                                        <button
                                            key={lng}
                                            onClick={() => setLanguage(lng)}
                                            className={`min-w-[44px] rounded-lg px-3 py-1.5 font-semibold transition-all duration-200 ${language === lng
                                                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-blue-500/30'
                                                : 'text-gray-400 hover:bg-white/10 hover:text-white'
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
                                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-gray-300 transition-all duration-200 hover:border-blue-400/50 hover:bg-white/10 hover:text-white active:scale-95"
                            >
                                <Home size={16} /> {t.home}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Mobile menu button */}
                <div className='fixed top-2 left-2 flex gap-4 z-40'>
                    <button
                        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                        className="menu-button flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-green-700 text-white shadow-2xl shadow-blue-500/40 transition-all duration-300 hover:scale-110 active:scale-95 md:hidden"
                        aria-label={isMobileSidebarOpen ? t.close : t.menu}
                    >
                        {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    {/* <button
                        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                        className="menu-button flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-400 via-green-300 to-gray-400 text-black shadow-2xl shadow-blue-500/40 transition-all duration-300 hover:scale-110 active:scale-95 md:hidden"
                        aria-label={isMobileSidebarOpen ? t.close : t.menu}
                    >
                        {<Rocket size={24} />}
                    </button> */}

                </div>


                <div className="grid items-start gap-4 md:grid-cols-[minmax(0,260px),1fr] lg:grid-cols-[minmax(0,280px),1fr]">
                    {/* Sidebar - Desktop */}
                    <aside className="hidden md:block top-6 h-fit rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl p-3 shadow-xl animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}>
                        <ul className="space-y-2">
                            {sections.map((section, index) => (
                                <li key={section.id} className="min-w-0 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${200 + index * 50}ms`, animationFillMode: 'backwards' }}>
                                    <button
                                        onClick={() => handleSectionChange(section.id)}
                                        className={`group relative flex w-full min-w-0 items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300 ${activeSection === section.id
                                            ? 'border-blue-500/50 bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-white shadow-lg shadow-blue-500/20'
                                            : 'border-transparent bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        <div className={`mt-0.5 transition-transform duration-300 ${activeSection === section.id ? 'text-blue-400 scale-110' : 'text-gray-400 group-hover:text-blue-400 group-hover:scale-110'}`}>
                                            {section.icon}
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <p className="text-sm font-semibold leading-tight">{section.label}</p>
                                            <p className="text-xs text-gray-400 leading-snug">{section.description}</p>
                                        </div>
                                        {activeSection === section.id && (
                                            <ChevronRight size={16} className="mt-1 text-blue-400 animate-in fade-in slide-in-from-left-2 duration-300" />
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    {/* Sidebar - Mobile (Slide in from right) */}
                    <aside
                        className={`mobile-sidebar fixed inset-y-0 right-0 z-50 w-full max-w-sm transform overflow-y-auto border-l border-white/10 bg-gradient-to-br from-gray-900/98 via-black/98 to-gray-900/98 backdrop-blur-xl p-6 shadow-2xl transition-transform duration-300 ease-out md:hidden ${isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'
                            }`}
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white">{t.menu}</h2>
                            <button
                                onClick={() => setIsMobileSidebarOpen(false)}
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:border-white/20 hover:text-white"
                                aria-label={t.close}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <ul className="space-y-3">
                            {sections.map((section) => (
                                <li key={section.id} className="min-w-0">
                                    <button
                                        onClick={() => handleSectionChange(section.id)}
                                        className={`group relative flex w-full min-w-0 items-start gap-3 rounded-xl border px-4 py-4 text-left transition-all duration-300 active:scale-95 ${activeSection === section.id
                                            ? 'border-blue-500/50 bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-white shadow-lg shadow-blue-500/20'
                                            : 'border-transparent bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        <div className={`mt-0.5 transition-transform duration-300 ${activeSection === section.id ? 'text-blue-400 scale-110' : 'text-gray-400'}`}>
                                            {section.icon}
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <p className="text-base font-semibold leading-tight">{section.label}</p>
                                            <p className="text-sm text-gray-400 leading-snug">{section.description}</p>
                                        </div>
                                        {activeSection === section.id && (
                                            <ChevronRight size={18} className="mt-1 text-blue-400" />
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => {
                            setModalLogout(true)
                            setIsMobileSidebarOpen(false)
                        }
                        } className='flex justify-center items-center h-10 bg-gradient-to-r from-red-900 rounded-lg to-black p-4 m-4'>
                            <LogOut size={24} color='red' /> {t.logout} </button>
                    </aside>

                    {/* Backdrop for mobile sidebar */}
                    {isMobileSidebarOpen && (
                        <div
                            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden"
                            onClick={() => setIsMobileSidebarOpen(false)}
                        />
                    )}

                    {/* Main content */}
                    <main
                        ref={mainRef}
                        className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/70 via-black/70 to-gray-900/70 backdrop-blur-xl p-4 sm:p-6 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500"
                        style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}
                    >
                        {!currentSection ? (
                            <div className="flex min-h-[60vh] items-center justify-center">
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span>{t.loading}</span>
                                </div>
                            </div>
                        ) : (
                            <div
                                ref={contentRef}
                                className={`min-h-[60vh] transition-all duration-300 ${isTransitioning
                                    ? 'opacity-0 scale-95'
                                    : 'opacity-100 scale-100 animate-in fade-in slide-in-from-bottom-4 duration-500'
                                    }`}
                            >
                                {currentSection.content}
                            </div>
                        )}
                    </main>
                </div>
            </div>

        </div>
    );
};

export default DashboardPage;