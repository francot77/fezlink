/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useEffect, useState, useCallback } from 'react';
import MetricsChart from '../features/metrics/components/MetricsChart';
import { SupportedLanguage } from '@/types/i18n';
import { Calendar, Filter, Globe, Smartphone, TrendingUp, TrendingDown, Minus, Sparkles, MapPin, Share2, X } from 'lucide-react';

interface Stat {
    _id: string;
    clicks: number;
    displayDate?: string;
    isMonthly?: boolean;
}

interface Trend {
    key: string;
    thisPeriod: number;
    lastPeriod: number;
    changePercent: number | null;
    hasEnoughData: boolean;
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
        specificMonth: 'Specific month',
        specificYear: 'Specific year',
        country: 'Country',
        all: 'All',
        source: 'Source',
        allSources: 'All sources',
        deviceType: 'Device',
        allDevices: 'All devices',
        loading: 'Loading...',
        noData: 'No data available for this period',
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
        clearFilters: 'Clear filters',
        january: 'January',
        february: 'February',
        march: 'March',
        april: 'April',
        may: 'May',
        june: 'June',
        july: 'July',
        august: 'August',
        september: 'September',
        october: 'October',
        november: 'November',
        december: 'December',
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
        specificMonth: 'Mes específico',
        specificYear: 'Año específico',
        country: 'País',
        all: 'Todos',
        source: 'Fuente',
        allSources: 'Todas',
        deviceType: 'Dispositivo',
        allDevices: 'Todos',
        loading: 'Cargando...',
        noData: 'No hay datos para este período',
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
        clearFilters: 'Limpiar filtros',
        january: 'Enero',
        february: 'Febrero',
        march: 'Marzo',
        april: 'Abril',
        may: 'Mayo',
        june: 'Junio',
        july: 'Julio',
        august: 'Agosto',
        september: 'Septiembre',
        october: 'Octubre',
        november: 'Noviembre',
        december: 'Diciembre',
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
    const [availableDevices, setAvailableDevices] = useState<string[]>([]);
    const [countryTotals, setCountryTotals] = useState<Record<string, number>>({});
    const [countryLoading, setCountryLoading] = useState(false);
    const [deviceTotals, setDeviceTotals] = useState<{ deviceType: string; clicks: number }[]>([]);
    const [sourceTotals, setSourceTotals] = useState<{ source: string; clicks: number }[]>([]);
    const [deviceTrends, setDeviceTrends] = useState<Trend[]>([]);
    const [sourceTrends, setSourceTrends] = useState<Trend[]>([]);
    //const [isMonthlyData, setIsMonthlyData] = useState(false);

    // Estados para filtros
    const [startDate, setStartDate] = useState(() => {
        const d = new Date(Date.now() - 6 * 24 * 3600 * 1000); // Últimos 7 días
        return d.toISOString().slice(0, 10);
    });
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        return d.toISOString().slice(0, 10);
    });

    const [activePreset, setActivePreset] = useState<'week' | 'month' | 'year' | 'custom'>('week');
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>('');
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
            email: 'Email',
            tiktok: 'TikTok',
            pinterest: 'Pinterest',
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
            email: 'Email',
            tiktok: 'TikTok',
            pinterest: 'Pinterest',
        },
    };

    const monthNames = language === 'es'
        ? ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Generar años disponibles (últimos 5 años)
    const currentYear = new Date().getFullYear();
    const availableYears = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

    const formatDeviceLabel = (type: string) => {
        const labels: Record<string, string> = {
            mobile: language === 'es' ? 'Móvil' : 'Mobile',
            desktop: language === 'es' ? 'Escritorio' : 'Desktop',
            tablet: language === 'es' ? 'Tableta' : 'Tablet',
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
            email: '📧',
            tiktok: '🎵',
            pinterest: '📌',
        };
        return icons[source] || '🌐';
    };

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        setError(null);
        setCountryLoading(true);
        try {
            // Construir URL con parámetros
            const url = new URL(`/api/analytics/link/${linkId}`, window.location.origin);
            url.searchParams.append('from', startDate);
            url.searchParams.append('to', endDate);

            // Agregar filtros si existen
            if (country) url.searchParams.append('country', country);
            if (deviceType) url.searchParams.append('device', deviceType);
            if (source) url.searchParams.append('source', source);

            const res = await fetch(url.toString());
            if (!res.ok) throw new Error('Failed to fetch analytics');

            const data = await res.json();

            setTotalClicks(data.totalClicks ?? 0);

            // Determinar si son datos mensuales
            const isMonthly = data.metadata?.frequency === 'monthly';
            //setIsMonthlyData(isMonthly);

            // Formatear fechas para display
            const formatForDisplay = (dateStr: string) => {
                if (isMonthly) {
                    const [year, month] = dateStr.split('-');
                    return `${monthNames[parseInt(month) - 1]} ${year}`;
                }
                const [year, month, day] = dateStr.split('-');
                return `${day}/${month}/${year.slice(-2)}`;
            };

            setStats(
                data.daily.map((d: { date: string; clicks: number }) => ({
                    _id: d.date,
                    clicks: d.clicks,
                    displayDate: formatForDisplay(d.date),
                    isMonthly: isMonthly,
                }))
            );

            setCountryTotals(data.byCountry || {});
            setAvailableCountries(Object.keys(data.byCountry || {}));
            setCountryLoading(false);

            setDeviceTrends(data.trends?.byDevice ?? []);
            setSourceTrends(data.trends?.bySource ?? []);

            // Actualizar fuentes disponibles
            setSourceTotals(
                Object.entries(data.bySource || {}).map(([source, clicks]) => ({
                    source,
                    clicks: Number(clicks),
                }))
            );
            setAvailableSources(Object.keys(data.bySource || {}));

            // Actualizar dispositivos disponibles
            setDeviceTotals(
                Object.entries(data.byDevice || {}).map(([deviceType, clicks]) => ({
                    deviceType,
                    clicks: Number(clicks),
                }))
            );
            setAvailableDevices(Object.keys(data.byDevice || {}));

        } catch (err) {
            setError('Failed to load analytics');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [linkId, startDate, endDate, country, deviceType, source, language]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const applyPreset = (preset: 'week' | 'month' | 'year') => {
        const end = new Date();
        const start = new Date(end);

        if (preset === 'week') {
            start.setDate(end.getDate() - 6); // Últimos 7 días
        } else if (preset === 'month') {
            start.setMonth(end.getMonth() - 1); // Últimos 30 días
        } else {
            start.setFullYear(end.getFullYear() - 1); // Último año
        }

        setEndDate(end.toISOString().slice(0, 10));
        setStartDate(start.toISOString().slice(0, 10));
        setActivePreset(preset);
        setSelectedMonth('');
        setSelectedYear('');
    };

    const handleMonthSelect = (monthIndex: number) => {
        const year = selectedYear || currentYear.toString();
        const start = new Date(parseInt(year), monthIndex, 1);
        const end = new Date(parseInt(year), monthIndex + 1, 0);

        setStartDate(start.toISOString().slice(0, 10));
        setEndDate(end.toISOString().slice(0, 10));
        setActivePreset('custom');
        setSelectedMonth(monthIndex.toString());
    };

    const handleYearSelect = (year: string) => {
        setSelectedYear(year);
        if (selectedMonth) {
            handleMonthSelect(parseInt(selectedMonth));
        } else {
            // Si no hay mes seleccionado, mostrar todo el año
            const start = new Date(parseInt(year), 0, 1);
            const end = new Date(parseInt(year), 11, 31);

            setStartDate(start.toISOString().slice(0, 10));
            setEndDate(end.toISOString().slice(0, 10));
            setActivePreset('custom');
        }
    };

    const clearFilters = () => {
        setCountry('');
        setDeviceType('');
        setSource('');
        applyPreset('week'); // Resetear a último semana
    };

    const handleStartDateChange = (value: string) => {
        setStartDate(value);
        setActivePreset('custom');
        setSelectedMonth('');
        setSelectedYear('');
    };

    const handleEndDateChange = (value: string) => {
        setEndDate(value);
        setActivePreset('custom');
        setSelectedMonth('');
        setSelectedYear('');
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

    const hasActiveFilters = country || deviceType || source;

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
                            {hasActiveFilters && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {country && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-1 text-xs text-purple-300">
                                            <MapPin size={10} />
                                            {country}
                                            <button onClick={() => setCountry('')} className="ml-1 hover:text-white">
                                                <X size={10} />
                                            </button>
                                        </span>
                                    )}
                                    {deviceType && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-1 text-xs text-cyan-300">
                                            <Smartphone size={10} />
                                            {formatDeviceLabel(deviceType)}
                                            <button onClick={() => setDeviceType('')} className="ml-1 hover:text-white">
                                                <X size={10} />
                                            </button>
                                        </span>
                                    )}
                                    {source && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300">
                                            <Share2 size={10} />
                                            {formatSourceLabel(source)}
                                            <button onClick={() => setSource('')} className="ml-1 hover:text-white">
                                                <X size={10} />
                                            </button>
                                        </span>
                                    )}
                                </div>
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
                <div className="relative p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="text-cyan-400" />
                            <h3 className="text-lg font-semibold text-white">{t.filters}</h3>
                        </div>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-300 hover:bg-red-500/20"
                            >
                                <X size={14} />
                                {t.clearFilters}
                            </button>
                        )}
                    </div>

                    {/* Quick Ranges */}
                    <div>
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

                    {/* Month and Year Selectors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-300">{t.specificMonth}</label>
                            <div className="flex flex-wrap gap-2">
                                {monthNames.map((month, index) => (
                                    <button
                                        key={month}
                                        onClick={() => handleMonthSelect(index)}
                                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${selectedMonth === index.toString()
                                            ? 'border-purple-400/60 bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-500/20'
                                            : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10'
                                            }`}
                                    >
                                        {month}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-300">{t.specificYear}</label>
                            <div className="flex flex-wrap gap-2">
                                {availableYears.map((year) => (
                                    <button
                                        key={year}
                                        onClick={() => handleYearSelect(year)}
                                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${selectedYear === year
                                            ? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
                                            : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10'
                                            }`}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Custom Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
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

                        <div>
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
                    </div>

                    {/* Filter by Device, Source, Country */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                {availableDevices.map((device) => (
                                    <option key={device} value={device}>
                                        {formatDeviceLabel(device)}
                                    </option>
                                ))}
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
                                    <option key={src} value={src}>
                                        {formatSourceLabel(src)}
                                    </option>
                                ))}
                            </select>
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
                        {hasActiveFilters && (
                            <p className="text-sm text-gray-500">
                                Try changing your filters or date range
                            </p>
                        )}
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