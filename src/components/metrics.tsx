/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import MetricsChart from './MetricsChart';
import { SupportedLanguage } from '@/types/i18n';
import { Calendar, Filter, Globe, Smartphone, TrendingUp, TrendingDown, Minus, Sparkles, MapPin, Share2 } from 'lucide-react';

interface Stat {
    _id: string;
    clicks: number;
}

interface Trend {
    key: string;
    thisWeek: number;
    lastWeek: number;
    changePercent: number | null;
    hasEnoughData: boolean;
    label?: string;
}

const translations: Record<SupportedLanguage, { [key: string]: string }> = {
    en: {
        title: 'Link Analytics',
        total: 'Total clicks',
        from: 'From',
        to: 'To',
        quickRanges: 'Quick ranges',
        lastWeek: 'Last 7 days',
        lastMonth: 'Last 30 days',
        lastYear: 'Last year',
        country: 'Country',
        all: 'All',
        source: 'Source',
        allSources: 'All sources',
        deviceType: 'Device',
        allDevices: 'All devices',
        deviceHint: 'Filter by device to see mobile vs desktop performance',
        loading: 'Loading...',
        noData: 'No data available for this period',
        dateError: 'Invalid date range',
        countryMetrics: 'Top countries',
        countryTotalsEmpty: 'No country data yet',
        countryClicks: 'clicks',
        deviceMetrics: 'Devices',
        unknownDevice: 'Unknown',
        deviceTotalsEmpty: 'No device data',
        sourceMetrics: 'Traffic sources',
        sourceTotalsEmpty: 'No source data',
        clickTrend: 'Click trends',
        weeklyChange: 'vs last period',
        trendNew: 'New',
        trendNoData: 'No data',
        filters: 'Filters',
    },
    es: {
        title: 'Analíticas del enlace',
        total: 'Total de clics',
        from: 'Desde',
        to: 'Hasta',
        quickRanges: 'Rangos rápidos',
        lastWeek: 'Últimos 7 días',
        lastMonth: 'Últimos 30 días',
        lastYear: 'Último año',
        country: 'País',
        all: 'Todos',
        source: 'Fuente',
        allSources: 'Todas',
        deviceType: 'Dispositivo',
        allDevices: 'Todos',
        deviceHint: 'Filtra por dispositivo para ver rendimiento móvil vs escritorio',
        loading: 'Cargando...',
        noData: 'No hay datos para este período',
        dateError: 'Rango de fechas inválido',
        countryMetrics: 'Principales países',
        countryTotalsEmpty: 'Sin datos de país',
        countryClicks: 'clics',
        deviceMetrics: 'Dispositivos',
        unknownDevice: 'Desconocido',
        deviceTotalsEmpty: 'Sin datos de dispositivo',
        sourceMetrics: 'Fuentes de tráfico',
        sourceTotalsEmpty: 'Sin datos de fuente',
        clickTrend: 'Tendencia de clics',
        weeklyChange: 'vs período anterior',
        trendNew: 'Nuevo',
        trendNoData: 'Sin datos',
        filters: 'Filtros',
    },
};

export default function Metrics({ linkId, selectedUrl, language = 'en' }: { linkId: string; selectedUrl?: string; language?: SupportedLanguage }) {
    const t = translations[language];
    const [stats, setStats] = useState<Stat[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [totalClicks, setTotalClicks] = useState(0);
    const [availableCountries, setAvailableCountries] = useState<string[]>([]);
    const [availableSources, setAvailableSources] = useState<string[]>([]);
    const [countryTotals, setCountryTotals] = useState<Record<string, number>>({});
    const [countryLoading, setCountryLoading] = useState(false);
    const [deviceTotals, setDeviceTotals] = useState<{ deviceType: string; clicks: number }[]>([]);
    const [sourceTotals, setSourceTotals] = useState<{ source: string; clicks: number }[]>([]);
    const [deviceTrends, setDeviceTrends] = useState<Trend[]>([]);
    const [sourceTrends, setSourceTrends] = useState<Trend[]>([]);

    const [startDate, setStartDate] = useState(() => {
        const d = new Date(Date.now() - 7 * 24 * 3600 * 1000);
        return d.toISOString().slice(0, 10);
    });
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        return d.toISOString().slice(0, 10);
    });
    const [activePreset, setActivePreset] = useState<'week' | 'month' | 'year' | null>('week');
    const [country, setCountry] = useState('');
    const [deviceType, setDeviceType] = useState('');
    const [source, setSource] = useState('');

    const sourceLabelPresets: Record<SupportedLanguage, Record<string, string>> = {
        en: {
            instagram_bio: 'Instagram',
            whatsapp: 'WhatsApp',
            qr_local: 'QR Code',
            direct: 'Direct',
            referral: 'Referral',
            facebook: 'Facebook',
            twitter: 'Twitter',
            linkedin: 'LinkedIn',
        },
        es: {
            instagram_bio: 'Instagram',
            whatsapp: 'WhatsApp',
            qr_local: 'Código QR',
            direct: 'Directo',
            referral: 'Referencia',
            facebook: 'Facebook',
            twitter: 'Twitter',
            linkedin: 'LinkedIn',
        },
    };

    const formatDeviceLabel = (type: string) => {
        const labels: Record<string, string> = {
            mobile: 'Mobile',
            desktop: 'Desktop',
            tablet: 'Tablet',
        };
        return labels[type] || t.unknownDevice;
    };

    const formatSourceLabel = (value: string) => {
        const preset = sourceLabelPresets[language]?.[value];
        if (preset) return preset;
        const normalized = value.replace(/[_-]+/g, ' ');
        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    };

    const getDeviceIcon = (type: string) => {
        if (type === 'mobile') return '📱';
        if (type === 'desktop') return '💻';
        if (type === 'tablet') return '📱';
        return '❓';
    };

    const getSourceIcon = (source: string) => {
        const icons: Record<string, string> = {
            instagram_bio: '📸',
            whatsapp: '💬',
            qr_local: '🔲',
            direct: '🔗',
            referral: '🔄',
            facebook: '📘',
            twitter: '🐦',
            linkedin: '💼',
        };
        return icons[source] || '🌐';
    };




    useEffect(() => {
        async function fetchAnalytics() {
            setLoading(true);
            setError(null);
            setCountryLoading(true)
            try {
                const res = await fetch(
                    `/api/analytics/link/${linkId}?from=${startDate}&to=${endDate}`
                );
                if (!res.ok) throw new Error();

                const data = await res.json();

                setTotalClicks(data.totalClicks ?? 0);

                setStats(
                    data.daily.map((d: { date: string; clicks: number }) => ({
                        _id: d.date,
                        clicks: d.clicks,
                    }))
                );

                setCountryTotals(data.byCountry || {});
                setAvailableCountries(Object.keys(data.byCountry || {}));
                setCountryLoading(false)
                setDeviceTrends(data.trends?.byDevice ?? []);
                setSourceTrends(data.trends?.bySource ?? []);

                setSourceTotals(
                    Object.entries(data.bySource || {}).map(([source, clicks]) => ({
                        source,
                        clicks: Number(clicks),
                    }))
                );
                setAvailableSources(Object.keys(data.bySource || {}));

                setDeviceTotals(
                    Object.entries(data.byDevice || {}).map(([deviceType, clicks]) => ({
                        deviceType,
                        clicks: Number(clicks),
                    }))
                );

            } catch {
                setError('Failed to load analytics');
            } finally {
                setLoading(false);
            }
        }

        fetchAnalytics();
    }, [linkId, startDate, endDate]);


    const applyPreset = (preset: 'week' | 'month' | 'year') => {
        const end = new Date();
        const start = new Date(end);

        if (preset === 'week') {
            start.setDate(end.getDate() - 6);
        } else if (preset === 'month') {
            start.setMonth(end.getMonth() - 1);
        } else {
            start.setFullYear(end.getFullYear() - 1);
        }

        setEndDate(end.toISOString().slice(0, 10));
        setStartDate(start.toISOString().slice(0, 10));
        setActivePreset(preset);
    };

    const handleStartDateChange = (value: string) => {
        setStartDate(value);
        setActivePreset(null);
    };

    const handleEndDateChange = (value: string) => {
        setEndDate(value);
        setActivePreset(null);
    };

    const renderTrendBadge = (trend?: Trend) => {
        if (!trend) return null;

        if (!trend.hasEnoughData) {
            return (
                <div className="flex items-center gap-1.5 rounded-full bg-gray-700/40 px-2.5 py-1">
                    <Minus size={12} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-400">{t.trendNoData}</span>
                </div>
            );
        }

        const percentText = trend.changePercent ?? 0;
        const isNegative = percentText < 0;
        const isNew = trend.changePercent === null;

        if (isNew) {
            return (
                <div className="flex items-center gap-1.5 rounded-full bg-purple-500/20 px-2.5 py-1 ring-1 ring-purple-500/30">
                    <Sparkles size={12} className="text-purple-400" />
                    <span className="text-xs font-semibold text-purple-300">{t.trendNew}</span>
                </div>
            );
        }

        const Icon = isNegative ? TrendingDown : TrendingUp;
        const colorClasses = isNegative
            ? 'bg-red-500/20 text-red-300 ring-red-500/30'
            : 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30';

        return (
            <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ring-1 ${colorClasses}`}>
                <Icon size={12} />
                <span className="text-xs font-semibold">
                    {percentText > 0 ? '+' : ''}{percentText}%
                </span>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />
                <div className="relative p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold text-white">{t.title}</h2>
                            {selectedUrl && (
                                <p className="text-sm text-gray-400">
                                    <span className="text-gray-500">Viewing: </span>
                                    <span className="font-medium text-emerald-400">{selectedUrl}</span>
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 px-6 py-4 ring-1 ring-white/10">
                                <p className="text-xs font-medium uppercase tracking-wider text-emerald-200">{t.total}</p>
                                <p className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                    {totalClicks.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />
                <div className="relative p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-cyan-400" />
                        <h3 className="text-lg font-semibold text-white">{t.filters}</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        <div className="sm:col-span-2">
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                                <Calendar size={14} className="text-emerald-400" />
                                {t.from}
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                max={endDate}
                                onChange={(e) => handleStartDateChange(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white backdrop-blur-sm transition focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                                <Calendar size={14} className="text-cyan-400" />
                                {t.to}
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                min={startDate}
                                max={new Date().toISOString().slice(0, 10)}
                                onChange={(e) => handleEndDateChange(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white backdrop-blur-sm transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-300">{t.quickRanges}</label>
                            <div className="flex flex-wrap gap-2">
                                {(['week', 'month', 'year'] as const).map((preset) => (
                                    <button
                                        key={preset}
                                        onClick={() => applyPreset(preset)}
                                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${activePreset === preset
                                            ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-500/20'
                                            : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10'
                                            }`}
                                    >
                                        {t[preset === 'week' ? 'lastWeek' : preset === 'month' ? 'lastMonth' : 'lastYear']}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                                <MapPin size={14} className="text-purple-400" />
                                {t.country}
                            </label>
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white backdrop-blur-sm transition focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            >
                                <option value="">{t.all}</option>
                                {availableCountries.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                                <Smartphone size={14} className="text-cyan-400" />
                                {t.deviceType}
                            </label>
                            <select
                                value={deviceType}
                                onChange={(e) => setDeviceType(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white backdrop-blur-sm transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                            >
                                <option value="">{t.allDevices}</option>
                                <option value="mobile">Mobile</option>
                                <option value="desktop">Desktop</option>
                                <option value="tablet">Tablet</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                                <Share2 size={14} className="text-emerald-400" />
                                {t.source}
                            </label>
                            <select
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white backdrop-blur-sm transition focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                                <option value="">{t.allSources}</option>
                                {availableSources.map((src) => (
                                    <option key={src} value={src}>{formatSourceLabel(src)}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading/Error/Empty States */}
            {loading && (
                <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 to-black/60 px-6 py-12 backdrop-blur-xl">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                    <span className="text-gray-300">{t.loading}</span>
                </div>
            )}

            {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-4 text-red-400">
                    {error}
                </div>
            )}

            {!loading && !error && stats.length === 0 && (
                <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/10 bg-gradient-to-br from-gray-900/40 to-black/40 backdrop-blur-xl p-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />
                    <div className="relative text-center space-y-3">
                        <Globe size={48} className="mx-auto text-gray-600" />
                        <p className="text-lg text-gray-400">{t.noData}</p>
                    </div>
                </div>
            )}

            {/* Chart */}
            {!loading && !error && stats.length > 0 && (
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />
                    <div className="relative p-6">
                        <h3 className="mb-4 text-xl font-semibold text-white">{t.clickTrend}</h3>
                        <MetricsChart stats={stats} />
                    </div>
                </div>
            )}

            {/* Devices */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Smartphone size={20} className="text-cyan-400" />
                    <h3 className="text-xl font-semibold text-white">{t.deviceMetrics}</h3>
                </div>
                {deviceTotals.length === 0 ? (
                    <p className="text-sm text-gray-400">{t.deviceTotalsEmpty}</p>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {deviceTotals.map((device) => {
                            const trend = deviceTrends.find((entry) => entry.key === device.deviceType);
                            return (
                                <div
                                    key={device.deviceType}
                                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-cyan-500/10"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                    <div className="relative p-5 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{getDeviceIcon(device.deviceType)}</span>
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{formatDeviceLabel(device.deviceType)}</p>
                                                    <p className="text-xs text-gray-500">{t.deviceType}</p>
                                                </div>
                                            </div>
                                            {renderTrendBadge(trend)}
                                        </div>
                                        <p className="text-3xl font-bold text-white">{device.clicks.toLocaleString()}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Sources */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Share2 size={20} className="text-emerald-400" />
                    <h3 className="text-xl font-semibold text-white">{t.sourceMetrics}</h3>
                </div>
                {sourceTotals.length === 0 ? (
                    <p className="text-sm text-gray-400">{t.sourceTotalsEmpty}</p>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {sourceTotals.map((entry) => {
                            const trend = sourceTrends.find((item) => item.key === entry.source);
                            return (
                                <div
                                    key={entry.source}
                                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-emerald-500/10"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                    <div className="relative p-5 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{getSourceIcon(entry.source)}</span>
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{formatSourceLabel(entry.source)}</p>
                                                    <p className="text-xs text-gray-500">{t.source}</p>
                                                </div>
                                            </div>
                                            {renderTrendBadge(trend)}
                                        </div>
                                        <p className="text-3xl font-bold text-white">{entry.clicks.toLocaleString()}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Countries */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                        <Globe size={20} className="text-purple-400" />
                        <h3 className="text-xl font-semibold text-white">{t.countryMetrics}</h3>
                    </div>
                    {countryLoading && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
                            {t.loading}
                        </div>
                    )}
                </div>
                {availableCountries.length === 0 ? (
                    <p className="text-sm text-gray-400">{t.countryTotalsEmpty}</p>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {availableCountries.map((code) => (
                            <button
                                key={code}
                                onClick={() => setCountry(code === country ? '' : code)}
                                className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${country === code
                                    ? 'border-purple-400/60 bg-purple-500/20 shadow-lg shadow-purple-500/20'
                                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3 text-left">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${country === code ? 'bg-purple-500/20' : 'bg-white/5'
                                            } transition-colors`}>
                                            <MapPin size={18} className={country === code ? 'text-purple-400' : 'text-gray-400'} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{code}</p>
                                            <p className="text-xs text-gray-400">{t.country}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-white">{countryTotals[code]?.toLocaleString() ?? 0}</p>
                                        <p className="text-xs text-gray-400">{t.countryClicks}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}