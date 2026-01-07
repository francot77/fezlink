import { ChevronRight, LogOut, X } from 'lucide-react';
import React from 'react';

export interface Section {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    content: React.ReactNode;
}

interface DashboardSidebarProps {
    sections: Section[];
    activeSection: string;
    onSectionChange: (id: string) => void;
    isMobileSidebarOpen: boolean;
    setIsMobileSidebarOpen: (isOpen: boolean) => void;
    onLogout: () => void;
    translations: {
        menu: string;
        close: string;
        logout: string;
    };
}

export const DashboardSidebar = ({
    sections,
    activeSection,
    onSectionChange,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    onLogout,
    translations: t,
}: DashboardSidebarProps) => {
    return (
        <>
            {/* Sidebar - Desktop */}
            <aside
                className="hidden md:block top-6 h-fit rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl p-3 shadow-xl animate-in fade-in slide-in-from-left-4 duration-500"
                style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}
            >
                <ul className="space-y-2">
                    {sections.map((section, index) => (
                        <li
                            key={section.id}
                            className="min-w-0 animate-in fade-in slide-in-from-left-4"
                            style={{
                                animationDelay: `${200 + index * 50}ms`,
                                animationFillMode: 'backwards',
                            }}
                        >
                            <button
                                onClick={() => onSectionChange(section.id)}
                                className={`group relative flex w-full min-w-0 items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300 ${activeSection === section.id
                                        ? 'border-blue-500/50 bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-white shadow-lg shadow-blue-500/20'
                                        : 'border-transparent bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <div
                                    className={`mt-0.5 transition-transform duration-300 ${activeSection === section.id
                                            ? 'text-blue-400 scale-110'
                                            : 'text-gray-400 group-hover:text-blue-400 group-hover:scale-110'
                                        }`}
                                >
                                    {section.icon}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                    <p className="text-sm font-semibold leading-tight">{section.label}</p>
                                    <p className="text-xs text-gray-400 leading-snug">{section.description}</p>
                                </div>
                                {activeSection === section.id && (
                                    <ChevronRight
                                        size={16}
                                        className="self-center text-blue-400  animate-in fade-in slide-in-from-left-2 duration-300"
                                    />
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
                                onClick={() => onSectionChange(section.id)}
                                className={`group relative flex w-full min-w-0 items-start gap-3 rounded-xl border px-4 py-4 text-left transition-all duration-300 active:scale-95 ${activeSection === section.id
                                        ? 'border-blue-500/50 bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-white shadow-lg shadow-blue-500/20'
                                        : 'border-transparent bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <div
                                    className={`mt-0.5 transition-transform duration-300 ${activeSection === section.id ? 'text-blue-400 scale-110' : 'text-gray-400'
                                        }`}
                                >
                                    {section.icon}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                    <p className="text-base font-semibold leading-tight">{section.label}</p>
                                    <p className="text-sm text-gray-400 leading-snug">{section.description}</p>
                                </div>
                                {activeSection === section.id && <ChevronRight size={18} className="mt-1 text-blue-400" />}
                            </button>
                        </li>
                    ))}
                </ul>
                <button
                    onClick={onLogout}
                    className="flex justify-center items-center h-10 bg-gradient-to-r from-red-900 rounded-lg to-black p-4 m-4"
                >
                    <LogOut size={24} color="red" /> {t.logout}{' '}
                </button>
            </aside>

            {/* Backdrop for mobile sidebar */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}
        </>
    );
};
