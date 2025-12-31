
'use client';
import React, { useState } from 'react';
import { Globe, MapPin } from 'lucide-react';
import { SupportedLanguage } from '@/types/i18n';
import MetricsChart from './MetricsChart';
import { MetricsFilters } from './MetricsFilters';
import { MetricCard } from './MetricCard';
import { useMetricsData } from '../hooks/useMetricsData';
import { MetricsFilters as FiltersType } from '../types/metrics';
import { getDeviceIcon, getSourceIcon, formatDeviceLabel, formatSourceLabel } from '../utils/metricsHelpers';
import { translations } from '../constants/translations';

interface MetricsProps {
    linkId: string;
    selectedUrl?: string;
    language?: SupportedLanguage;
}

export default function Metrics({ linkId, selectedUrl, language = 'en' }: MetricsProps) {
    const t = translations[language];

    // Estado de filtros
    const [filters, setFilters] = useState<FiltersType>({
        startDate: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        country: '',
        deviceType: '',
        source: '',
        activePreset: 'week',
        selectedMonth: '',
        selectedYear: ''
    });

    // Fetch data con el custom hook
    const { data, loading, error } = useMetricsData({
        linkId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        country: filters.country,
        deviceType: filters.deviceType,
        source: filters.source,
        language
    });

    const handleFiltersChange = (newFilters: Partial<FiltersType>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const clearFilters = () => {
        const end = new Date();
        const start = new Date(end.getTime() - 6 * 24 * 3600 * 1000);
        setFilters({
            startDate: start.toISOString().slice(0, 10),
            endDate: end.toISOString().slice(0, 10),
            country: '',
            deviceType: '',
            source: '',
            activePreset: 'week',
            selectedMonth: '',
            selectedYear: ''
        });
    };

    const hasActiveFilters = filters.country || filters.deviceType || filters.source;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />
                <div className="relative p-4 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white">{t.title}</h2>
                            {selectedUrl && (
                                <p className="text-xs sm:text-sm text-gray-400 break-all">
                                    <span className="text-gray-500">Viewing: </span>
                                    <span className="font-medium text-emerald-400">{selectedUrl}</span>
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 px-4 sm:px-6 py-3 sm:py-4 ring-1 ring-white/10">
                                <p className="text-xs font-medium uppercase tracking-wider text-emerald-200">{t.total}</p>
                                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                    {data.totalClicks.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <MetricsFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={clearFilters}
                availableCountries={data.availableCountries}
                availableSources={data.availableSources}
                availableDevices={data.availableDevices}
                translations={t}
                language={language}
            />

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 to-black/60 px-6 py-12 backdrop-blur-xl">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                    <span className="text-gray-300">{t.loading}</span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-4 text-red-400">
                    {error}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && data.stats.length === 0 && (
                <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/10 bg-gradient-to-br from-gray-900/40 to-black/40 backdrop-blur-xl p-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />
                    <div className="relative text-center space-y-3">
                        <Globe size={48} className="mx-auto text-gray-600" />
                        <p className="text-lg text-gray-400">{t.noData}</p>
                        {hasActiveFilters && (
                            <p className="text-sm text-gray-500">
                                {language === 'es' ? 'Prueba cambiando tus filtros o rango de fechas' : 'Try changing your filters or date range'}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Chart */}
            {!loading && !error && data.stats.length > 0 && (
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />
                    <div className="relative p-4 sm:p-6">
                        <h3 className="mb-4 text-lg sm:text-xl font-semibold text-white">{t.clickTrend}</h3>
                        <MetricsChart stats={data.stats} />
                    </div>
                </div>
            )}

            {/* Device Metrics */}
            {data.deviceTotals.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                        📱 {t.deviceMetrics}
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {data.deviceTotals.map((device) => {
                            const trend = data.deviceTrends.find((entry) => entry.key === device.deviceType);
                            return (
                                <MetricCard
                                    key={device.deviceType}
                                    icon={getDeviceIcon(device.deviceType)}
                                    label={formatDeviceLabel(device.deviceType, language)}
                                    subtitle={t.deviceType}
                                    value={device.clicks}
                                    trend={trend}
                                    accentColor="cyan"
                                    trendLabels={{ trendNew: t.trendNew, trendNoData: t.trendNoData }}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Source Metrics */}
            {data.sourceTotals.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                        🌐 {t.sourceMetrics}
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {data.sourceTotals.map((entry) => {
                            const trend = data.sourceTrends.find((item) => item.key === entry.source);
                            return (
                                <MetricCard
                                    key={entry.source}
                                    icon={getSourceIcon(entry.source)}
                                    label={formatSourceLabel(entry.source, language)}
                                    subtitle={t.source}
                                    value={entry.clicks}
                                    trend={trend}
                                    accentColor="emerald"
                                    trendLabels={{ trendNew: t.trendNew, trendNoData: t.trendNoData }}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Country Metrics */}
            {data.availableCountries.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                        🌍 {t.countryMetrics}
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {data.availableCountries.map((code) => (
                            <button
                                key={code}
                                onClick={() => handleFiltersChange({ country: code === filters.country ? '' : code })}
                                className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${filters.country === code
                                    ? 'border-purple-400/60 bg-purple-500/20 shadow-lg shadow-purple-500/20'
                                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3 text-left">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${filters.country === code ? 'bg-purple-500/20' : 'bg-white/5'
                                            } transition-colors`}>
                                            <MapPin size={18} className={filters.country === code ? 'text-purple-400' : 'text-gray-400'} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{code}</p>
                                            <p className="text-xs text-gray-400">{t.country}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl sm:text-2xl font-bold text-white">
                                            {data.countryTotals[code]?.toLocaleString() ?? 0}
                                        </p>
                                        <p className="text-xs text-gray-400">{t.countryClicks}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}