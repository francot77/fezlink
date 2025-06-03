'use client';

import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useUser } from '@clerk/nextjs';
import Spinner from '@/components/spinner';

const DashboardPage: React.FC = () => {
    const { renderButtons, renderSection, activeLink } = useDashboard();
    const { isLoaded } = useUser();

    if (!isLoaded) {
        return (
            <div className="flex justify-center items-center w-full h-screen flex-col gap-3 bg-gray-900">
                <span className="text-white text-lg">Cargando...</span>
                <Spinner color="white" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 pb-24 md:pb-6">
            <h1 className="text-4xl md:text-5xl font-extrabold mt-6 mb-8 text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
                FezLink Dashboard
            </h1>

            <div className="w-full max-w-6xl rounded-xl bg-gray-800 shadow-2xl shadow-blue-900/20 overflow-hidden border border-gray-700 flex flex-col md:flex-row relative">
                {/* Sidebar en mobile (bottom), en desktop (left) */}
                <aside className="w-full md:w-64 bg-gray-800 border-t md:border-t-0 md:border-r border-gray-700 z-10 transition-all duration-300 ease-in-out">
                    <ul className="flex md:flex-col justify-around md:justify-start items-center md:items-stretch py-3 md:py-6 md:px-4 space-y-2">
                        {renderButtons()}
                    </ul>
                </aside>

                <main className="flex-1 p-4 md:p-6 pt-6 md:pt-6 pb-28 md:pb-6">
                    <div className="bg-gray-700/30 backdrop-blur-sm rounded-lg p-6 min-h-[60vh]">
                        {renderSection(activeLink!)}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;
