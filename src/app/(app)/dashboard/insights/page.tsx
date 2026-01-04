// app/dashboard/insights/page.tsx
'use client';

import { Suspense } from 'react';
import InsightsDashboard from '@/components/insights/InsightsDashboard';
import { Sparkles } from 'lucide-react';

export default function InsightsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-[#0b1224] to-black">
            {/* Header */}
            <div className="border-b border-gray-800 bg-[#0b1224]/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <Sparkles className="text-emerald-400" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Insights
                            </h1>
                            <p className="text-sm text-gray-400">
                                Descubre patrones y oportunidades en tus datos
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                <Suspense fallback={<LoadingSkeleton />}>
                    <InsightsDashboard />
                </Suspense>
            </div>

            {/* Footer info */}
            <div className="container mx-auto px-4 py-8">
                <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                    <p className="text-sm text-gray-400">
                        💡 Los insights se actualizan automáticamente cuando hay nuevos datos.
                        Usa los filtros para explorar categorías específicas.
                    </p>
                </div>
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <div className="h-8 w-32 bg-gray-800 rounded animate-pulse" />
                    <div className="h-4 w-48 bg-gray-800 rounded animate-pulse" />
                </div>
                <div className="h-10 w-32 bg-gray-800 rounded animate-pulse" />
            </div>

            {/* Cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-48 bg-gray-800/50 rounded-xl border border-gray-700 animate-pulse"
                    />
                ))}
            </div>
        </div>
    );
}