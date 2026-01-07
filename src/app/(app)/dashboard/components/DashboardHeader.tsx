import Link from 'next/link';
import { Home, Globe, Menu, X } from 'lucide-react';
import { SupportedLanguage } from '@/types/i18n';
import { Section } from './DashboardSidebar';

interface DashboardHeaderProps {
    userName?: string | null;
    language: SupportedLanguage;
    setLanguage: (lang: SupportedLanguage) => void;
    isMobileSidebarOpen: boolean;
    setIsMobileSidebarOpen: (isOpen: boolean) => void;
    quickMenuEnabled?: boolean;
    sections?: Section[];
    activeSection?: string;
    onSectionChange?: (id: string) => void;
    translations: {
        welcome: string;
        dashboardTitle: string;
        description: string;
        language: string;
        home: string;
        menu: string;
        close: string;
        logout?: string;
    };
}

export const DashboardHeader = ({
    userName,
    language,
    setLanguage,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    quickMenuEnabled,
    sections,
    activeSection,
    onSectionChange,
    translations: t,
}: DashboardHeaderProps) => {
    return (
        <>
            {/* Header - Mobile Version (Compact) */}
            <div className="md:hidden relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl pt-7 p-4 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
                <div className="relative space-y-3">
                    {/* Top row: Name + Language selector */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500 mb-0.5">{t.welcome}</p>
                            <h1 className="bg-gradient-to-r from-green-700 via-green-400 to-white bg-clip-text text-xl font-extrabold text-transparent truncate">
                                {userName || t.dashboardTitle}
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
                            {userName || t.dashboardTitle}
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

            {/* Mobile menu button or Quick Pills */}
            {quickMenuEnabled && sections && onSectionChange ? (
                <div className="fixed top-2 inset-x-0 z-40 flex justify-center pointer-events-none md:hidden animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center gap-1.5 p-1.5 rounded-full border border-white/10 bg-gray-900/90 backdrop-blur-xl shadow-2xl pointer-events-auto overflow-x-auto max-w-[calc(100vw-16px)] no-scrollbar ring-1 ring-white/5">
                        {sections
                            .filter(section => section.id !== 'premium')
                            .map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => onSectionChange(section.id)}
                                    className={`group relative flex items-center justify-center h-9 w-9 rounded-full transition-all duration-300 ${activeSection === section.id
                                            ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/30 scale-105'
                                            : 'text-gray-400 hover:bg-white/10 hover:text-white hover:scale-110'
                                        }`}
                                    aria-label={section.label}
                                >
                                    <span className="relative z-10 transition-transform duration-200 group-active:scale-90">
                                        {section.icon}
                                    </span>
                                </button>
                            ))}
                        <div className="w-px h-4 bg-white/10 mx-1" />
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:scale-110 transition-all duration-300 active:scale-95"
                            aria-label={t.menu}
                        >
                            <Menu size={18} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="fixed top-2 left-2 flex gap-4 z-40">
                    <button
                        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                        className="menu-button flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-green-700 text-white shadow-2xl shadow-blue-500/40 transition-all duration-300 hover:scale-110 hover:shadow-green-500/50 active:scale-95 md:hidden ring-2 ring-transparent hover:ring-white/20"
                        aria-label={isMobileSidebarOpen ? t.close : t.menu}
                    >
                        {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            )}
        </>
    );
};
