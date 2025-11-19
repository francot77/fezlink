/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import MetricsChart from './MetricsChart';
import { SupportedLanguage } from '@/types/i18n';

interface Stat {
    _id: { year: number; month: number; day: number };
    clicks: number;
}

interface StatsResponse {
    stats: Stat[];
    deviceTotals?: { deviceType: string; clicks: number }[];
    sourceTotals?: { source: string; clicks: number }[];
    deviceTrends?: Trend[];
    sourceTrends?: Trend[];
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
        title: 'Link metrics',
        total: 'Total clicks',
        from: 'From',
        to: 'To',
        country: 'Country',
        all: 'All',
        source: 'Source',
        allSources: 'All sources',
        deviceType: 'Device type',
        allDevices: 'All devices',
        deviceHint: 'Use the device filter to compare mobile vs desktop traffic.',
        loading: 'Loading stats...',
        noData: 'No data available to display.',
        dateError: 'The date range is invalid',
        countryMetrics: 'Country insights',
        countryTotalsEmpty: 'No country data yet. Start sharing your link to see more!',
        countryClicks: 'clicks',
        deviceMetrics: 'Device insights',
        unknownDevice: 'Unknown device',
        deviceTotalsEmpty: 'No device data captured for this range yet.',
        sourceMetrics: 'Source insights',
        sourceTotalsEmpty: 'No source data captured for this range yet.',
        clickTrend: 'Click performance',
        weeklyChange: 'this week',
        trendNew: 'New this week',
        trendNoData: 'No data this week yet',
    },
    es: {
        title: 'Métricas del enlace',
        total: 'Total de clics',
        from: 'Desde',
        to: 'Hasta',
        country: 'País',
        all: 'Todos',
        source: 'Fuente',
        allSources: 'Todas las fuentes',
        deviceType: 'Tipo de dispositivo',
        allDevices: 'Todos los dispositivos',
        deviceHint: 'Usa el filtro por dispositivo para comparar tráfico móvil y desktop.',
        loading: 'Cargando estadísticas...',
        noData: 'No hay datos para mostrar.',
        dateError: 'El rango de fechas es inválido',
        countryMetrics: 'Detalles por país',
        countryTotalsEmpty: 'Aún no hay datos por país. ¡Comparte tu enlace para ver más!',
        countryClicks: 'clics',
        deviceMetrics: 'Detalles por dispositivo',
        unknownDevice: 'Dispositivo desconocido',
        deviceTotalsEmpty: 'Aún no hay datos por dispositivo en este rango.',
        sourceMetrics: 'Detalles por fuente',
        sourceTotalsEmpty: 'Aún no hay datos por fuente en este rango.',
        clickTrend: 'Evolución de clics',
        weeklyChange: 'esta semana',
        trendNew: 'Nuevo esta semana',
        trendNoData: 'Sin datos esta semana',
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
    const [country, setCountry] = useState('');
    const [deviceType, setDeviceType] = useState('');
    const [source, setSource] = useState('');

    const sourceLabelPresets: Record<SupportedLanguage, Record<string, string>> = {
        en: {
            instagram_bio: 'Instagram bio',
            whatsapp: 'WhatsApp',
            qr_local: 'QR downloads',
            direct: 'Direct',
            referral: 'Referral',
        },
        es: {
            instagram_bio: 'Bio de Instagram',
            whatsapp: 'WhatsApp',
            qr_local: 'Descargas QR',
            direct: 'Directo',
            referral: 'Referencia',
        },
    };

    const formatDeviceLabel = (type: string) => {
        switch (type) {
            case 'mobile':
                return 'Mobile';
            case 'desktop':
                return 'Desktop';
            case 'tablet':
                return 'Tablet';
            default:
                return t.unknownDevice;
        }
    };

    const formatSourceLabel = (value: string) => {
        const preset = sourceLabelPresets[language]?.[value];
        if (preset) return preset;
        const normalized = value.replace(/[_-]+/g, ' ');
        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    };

    // Fetch resumen total (totalClicks y countries)
    useEffect(() => {
        async function fetchSummary() {
            try {
                const res = await fetch(`/api/metrics/summary?linkId=${linkId}`);
                if (!res.ok) throw new Error('Error fetching summary');
                const data = await res.json();
                setTotalClicks(data.totalClicks || 0);
                setAvailableCountries(data.countries || []);
                setAvailableSources(Object.keys(data.clicksBySource || {}));
            } catch (err: any) {
                console.error(err.message);
            }
        }
        fetchSummary();
    }, [linkId]);

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({
                    linkId,
                    startDate: new Date(startDate).toISOString(),
                    endDate: new Date(endDate).toISOString(),
                    groupByDevice: 'true',
                });
                if (country) params.append('country', country);
                if (deviceType) params.append('deviceType', deviceType);
                if (source) params.append('source', source);
                params.append('groupBySource', 'true');

                const res = await fetch(`/api/metrics?${params.toString()}`);
                if (!res.ok) throw new Error('Error fetching stats');
                const data: StatsResponse = await res.json();
                setStats(data.stats);
                setDeviceTotals(data.deviceTotals ?? []);
                setSourceTotals(data.sourceTotals ?? []);
                setDeviceTrends(data.deviceTrends ?? []);
                setSourceTrends(data.sourceTrends ?? []);
            } catch (err: any) {
                setError(err.message);
                setDeviceTotals([]);
                setDeviceTrends([]);
                setSourceTrends([]);
            } finally {
                setLoading(false);
            }
        }

        if (startDate && endDate && new Date(startDate) <= new Date(endDate)) {
            fetchStats();
        } else {
            setStats([]);
            setError(t.dateError);
            setDeviceTotals([]);
        }
    }, [linkId, startDate, endDate, country, deviceType, source, t]);

    useEffect(() => {
        const fetchCountryTotals = async () => {
            if (!availableCountries.length || !startDate || !endDate || new Date(startDate) > new Date(endDate)) {
                setCountryTotals({});
                return;
            }

            setCountryLoading(true);
            const totals: Record<string, number> = {};
            await Promise.all(
                availableCountries.map(async (code) => {
                    try {
                        const params = new URLSearchParams({
                            linkId,
                            startDate: new Date(startDate).toISOString(),
                            endDate: new Date(endDate).toISOString(),
                            country: code,
                        });
                        if (source) params.append('source', source);
                        const res = await fetch(`/api/metrics?${params.toString()}`);
                        if (!res.ok) return;
                        const data: StatsResponse = await res.json();
                        totals[code] = data.stats.reduce((acc, stat) => acc + stat.clicks, 0);
                    } catch (err) {
                        console.error('Error fetching country stats', err);
                    }
                })
            );
            setCountryTotals(totals);
            setCountryLoading(false);
        };

        fetchCountryTotals();
    }, [availableCountries, endDate, linkId, source, startDate]);

    const renderTrendBadge = (trend?: Trend) => {
        if (!trend) return null;

        const baseClasses = 'rounded-full px-3 py-1 text-xs font-semibold';

        if (!trend.hasEnoughData) {
            return <span className={`${baseClasses} bg-gray-700/40 text-gray-200`}>{t.trendNoData}</span>;
        }

        const percentText = trend.changePercent ?? 0;
        const isNegative = percentText < 0;
        const colorClasses = isNegative ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300';
        const labelText = trend.changePercent === null ? t.trendNew : `${percentText > 0 ? '+' : ''}${percentText}% ${t.weeklyChange}`;

        return <span className={`${baseClasses} ${colorClasses}`}>{labelText}</span>;
    };

    return (
        <div className="space-y-6 rounded-2xl border border-gray-800/80 bg-gradient-to-b from-gray-900/80 via-[#0c1428] to-black/70 p-6 shadow-2xl shadow-blue-900/20">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                    <p className="text-sm text-gray-400">{t.subtitle}</p>
                    <h2 className="text-2xl font-bold text-white">{t.title}</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                    <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-wide text-blue-200/80">{t.total}</p>
                        <p className="text-3xl font-extrabold text-white">{totalClicks.toLocaleString()}</p>
                    </div>
                    {selectedUrl && (
                        <div className="max-w-xl truncate rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-sm text-gray-200 shadow-inner">
                            <span className="text-gray-400">{t.viewing}: </span>
                            <span className="font-semibold text-white">{selectedUrl}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="rounded-xl border border-gray-800/80 bg-gray-900/60 p-4 shadow-lg shadow-blue-900/10">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
                    <div>
                        <label htmlFor="startDate" className="mb-1 block text-sm font-medium text-gray-300">
                            {t.from}
                        </label>
                        <input
                            id="startDate"
                            type="date"
                            value={startDate}
                            max={endDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="endDate" className="mb-1 block text-sm font-medium text-gray-300">
                            {t.to}
                        </label>
                        <input
                            id="endDate"
                            type="date"
                            value={endDate}
                            min={startDate}
                            max={new Date().toISOString().slice(0, 10)}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="country" className="mb-1 block text-sm font-medium text-gray-300">
                            {t.country}
                        </label>
                        <select
                            id="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full appearance-none rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">{t.all}</option>
                            {availableCountries.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="deviceType" className="mb-1 block text-sm font-medium text-gray-300">
                            {t.deviceType}
                        </label>
                        <select
                            id="deviceType"
                            value={deviceType}
                            onChange={(e) => setDeviceType(e.target.value)}
                            className="w-full appearance-none rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">{t.allDevices}</option>
                            <option value="mobile">Mobile</option>
                            <option value="desktop">Desktop</option>
                            <option value="tablet">Tablet</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="source" className="mb-1 block text-sm font-medium text-gray-300">
                            {t.source}
                        </label>
                        <select
                            id="source"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className="w-full appearance-none rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">{t.allSources}</option>
                            {availableSources.map((src) => (
                                <option key={src} value={src}>
                                    {formatSourceLabel(src)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <p className="col-span-full text-xs text-gray-400">{t.deviceHint}</p>
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-800 bg-gray-900/70 px-4 py-6 text-gray-300">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-white"></span>
                    {t.loading}
                </div>
            )}
            {error && <div className="text-red-400 text-sm">{error}</div>}
            {!loading && !error && stats.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900/60 px-4 py-6 text-sm text-gray-400">
                    {t.noData}
                </div>
            )}

            {!loading && !error && stats.length > 0 && (
                <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-4 shadow-inner">
                    <div className="mb-2 flex items-center justify-between gap-4 text-sm text-gray-300">
                        <h3 className="text-base font-semibold text-white">{t.clickTrend}</h3>
                    </div>
                    <MetricsChart stats={stats} />
                </div>
            )}

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{t.deviceMetrics}</h3>
                </div>
                {deviceTotals.length === 0 ? (
                    <p className="text-sm text-gray-400">{t.deviceTotalsEmpty}</p>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {deviceTotals.map((device) => {
                            const trend = deviceTrends.find((entry) => entry.key === device.deviceType);

                            return (
                            <div
                                key={device.deviceType}
                                className="rounded-lg border border-gray-800 bg-gradient-to-br from-gray-900/80 to-black/60 px-4 py-3 shadow-md"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-semibold text-white">{formatDeviceLabel(device.deviceType)}</p>
                                        <p className="text-xs text-gray-400">{t.deviceType}</p>
                                    </div>
                                    {renderTrendBadge(trend)}
                                </div>
                                <p className="mt-2 text-2xl font-bold text-white">{device.clicks.toLocaleString()}</p>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{t.sourceMetrics}</h3>
                </div>
                {sourceTotals.length === 0 ? (
                    <p className="text-sm text-gray-400">{t.sourceTotalsEmpty}</p>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {sourceTotals.map((entry) => {
                            const trend = sourceTrends.find((item) => item.key === entry.source);

                            return (
                            <div
                                key={entry.source}
                                className="rounded-lg border border-gray-800 bg-gradient-to-br from-gray-900/80 to-black/60 px-4 py-3 shadow-md"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-semibold text-white">{formatSourceLabel(entry.source)}</p>
                                        <p className="text-xs text-gray-400">{t.source}</p>
                                    </div>
                                    {renderTrendBadge(trend)}
                                </div>
                                <p className="mt-2 text-2xl font-bold text-white">{entry.clicks.toLocaleString()}</p>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{t.countryMetrics}</h3>
                    {countryLoading && <span className="text-xs text-gray-400 animate-pulse">{t.loading}</span>}
                </div>
                {availableCountries.length === 0 ? (
                    <p className="text-sm text-gray-400">{t.countryTotalsEmpty}</p>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {availableCountries.map((code) => (
                            <button
                                key={code}
                                onClick={() => setCountry(code === country ? '' : code)}
                                className={`flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left transition ${
                                    country === code
                                        ? 'border-blue-500 bg-blue-500/10 text-white'
                                        : 'border-gray-800 bg-gray-900 text-gray-200 hover:border-gray-600'
                                }`}
                            >
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold">{code}</p>
                                    <p className="text-xs text-gray-400">{country === code ? t.loading : t.country}</p>
                                </div>
                                <span className="text-lg font-bold text-white">
                                    {countryTotals[code] ?? 0} {t.countryClicks}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
