/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useInsights } from '@/hooks/useInsights';
import { InsightCard } from './InsightCard';
import { InsightDetail } from './InsightDetail';
import { LoadingState, EmptyState } from './LoadingState';

import { mapInsight } from './insightMapper';
import { RefreshCw, Filter } from 'lucide-react';

type InsightCategory = 'all' | 'traffic' | 'geography' | 'performance' | 'temporal' | 'device' | 'source';

export default function InsightsDashboard() {
    const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'yearly'>('30d');
    const { response, loading, error, refetch } = useInsights(period);
    const [selectedInsight, setSelectedInsight] = useState<any | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<InsightCategory>('all');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Auto-refresh cuando está pending o calculating
    useEffect(() => {
        if (response?.status === 'pending' || response?.status === 'calculating') {
            const timer = setTimeout(() => {
                refetch();
            }, 3000); // Polling cada 3s

            return () => clearTimeout(timer);
        }
    }, [response?.status, refetch]);

    const insights = useMemo(() => {
        if (!response || response.status !== 'completed') return [];
        return response.data.insights.map(mapInsight);
    }, [response]);

    const filteredInsights = useMemo(() => {
        if (categoryFilter === 'all') return insights;
        return insights.filter((i: any) => i.category === categoryFilter);
    }, [insights, categoryFilter]);

    const stats = useMemo(() => {
        if (!response || response.status !== 'completed') return null;

        const byType = insights.reduce((acc: any, i: any) => {
            acc[i.type] = (acc[i.type] || 0) + 1;
            return acc;
        }, {});

        const byCategory = insights.reduce((acc: any, i: any) => {
            acc[i.category] = (acc[i.category] || 0) + 1;
            return acc;
        }, {});

        return {
            total: insights.length,
            byType,
            byCategory,
            totalClicks: response.data.totalClicks,
            totalLinks: response.data.totalLinks
        };
    }, [insights, response]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch(true); // force refresh
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    // Loading states
    if (loading && !response) {
        return <LoadingState message="Cargando insights..." />;
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                    <span>Error al cargar insights</span>
                </div>
                <button
                    onClick={() => refetch()}
                    className="mt-4 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    // Pending/Calculating states
    if (response?.status === 'pending' || response?.status === 'calculating') {
        const isPending = response.status === 'pending';
        return (
            <LoadingState
                message={isPending ? 'Generando insights...' : 'Calculando insights...'}
                submessage={`Tiempo estimado: ${response.estimatedWaitTime}s`}
                showSpinner
            />
        );
    }

    // Error state
    if (response?.status === 'error') {
        return (
            <div className="p-8 text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                    <span>{response.error || 'Error desconocido'}</span>
                </div>
                <p className="text-sm text-gray-400">{response.message}</p>
                <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    // Empty state
    if (insights.length === 0) {
        return <EmptyState onRefresh={handleRefresh} />;
    }

    return (
        <div className="space-y-6">
            {/* Header con stats */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Insights</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        {stats?.total} insights detectados • {stats?.totalClicks.toLocaleString()} clicks • {stats?.totalLinks} links
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Period selector */}
                    <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
                        {(['7d', '30d', '90d', 'yearly'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 text-sm rounded-md transition-all ${period === p
                                        ? 'bg-emerald-500 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                    }`}
                            >
                                {p === 'yearly' ? '1 año' : p}
                            </button>
                        ))}
                    </div>

                    {/* Refresh button */}
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all disabled:opacity-50"
                        title="Refrescar insights"
                    >
                        <RefreshCw
                            size={18}
                            className={`text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`}
                        />
                    </button>
                </div>
            </div>

            {/* Type summary badges */}
            {stats && (
                <div className="flex flex-wrap gap-2">
                    {Object.entries(stats.byType).map(([type, count]: [string, any]) => {
                        const colors: Record<string, string> = {
                            positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                            opportunity: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                            warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                            critical: 'bg-red-500/10 text-red-400 border-red-500/20',
                            info: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        };

                        return (
                            <div
                                key={type}
                                className={`px-3 py-1 text-xs border rounded-full ${colors[type]}`}
                            >
                                {count} {type}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Category filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <Filter size={16} className="text-gray-400 shrink-0" />
                {(['all', 'traffic', 'geography', 'performance', 'temporal', 'device', 'source'] as const).map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-all whitespace-nowrap ${categoryFilter === cat
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-gray-800/30 text-gray-400 hover:text-white hover:bg-gray-800/50'
                            }`}
                    >
                        {cat === 'all' ? 'Todos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                        {cat !== 'all' && stats && (
                            <span className="ml-1.5 opacity-60">({stats.byCategory[cat] || 0})</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Insights grid */}
            {filteredInsights.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    No hay insights en esta categoría
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredInsights.map((insight: any) => (
                        <InsightCard
                            key={insight.id}
                            insight={insight}
                            onClick={() => setSelectedInsight(insight)}
                        />
                    ))}
                </div>
            )}

            {/* Detail panel */}
            {selectedInsight && (
                <InsightDetail
                    insight={selectedInsight}
                    onClose={() => setSelectedInsight(null)}
                />
            )}
        </div>
    );
}