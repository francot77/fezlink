'use client'
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
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                FezLink Dashboard
            </h1>

            <div className="w-full max-w-6xl rounded-xl bg-gray-800 shadow-2xl shadow-blue-900/20 overflow-hidden border border-gray-700 min-h-1/2">
                <div className="flex flex-col md:flex-row">

                    <aside className="md:w-64 p-4 border-b md:border-b-0 md:border-r border-gray-700">
                        <ul className="space-y-3">
                            {renderButtons()}
                        </ul>
                    </aside>


                    <main className="p-6 w-full">
                        <div className="bg-gray-700/30 backdrop-blur-sm rounded-lg p-6 min-h-[60vh]">
                            {renderSection(activeLink!)}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;