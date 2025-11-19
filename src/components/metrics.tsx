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
    },
};

export default function Metrics({ linkId, language = 'en' }: { linkId: string; language?: SupportedLanguage }) {
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
            } catch (err: any) {
                setError(err.message);
                setDeviceTotals([]);
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

    return (
        <div className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-white">{t.title}</h2>


            <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 mb-6 backdrop-blur-sm w-fit">
                <p className="text-lg text-gray-300">{t.total}:</p>
                <p className="text-4xl font-extrabold text-white">{totalClicks}</p>
            </div>


            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">

                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">
                        {t.from}
                    </label>
                    <input
                        id="startDate"
                        type="date"
                        value={startDate}
                        max={endDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full border-gray-600 rounded-md bg-gray-900 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>


                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">
                        {t.to}
                    </label>
                    <input
                        id="endDate"
                        type="date"
                        value={endDate}
                        min={startDate}
                        max={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full border-gray-600 rounded-md bg-gray-900 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>


                <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">
                        {t.country}
                    </label>
                    <select
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full border-gray-600 rounded-md bg-gray-900 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
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
                    <label htmlFor="deviceType" className="block text-sm font-medium text-gray-300 mb-1">
                        {t.deviceType}
                    </label>
                    <select
                        id="deviceType"
                        value={deviceType}
                        onChange={(e) => setDeviceType(e.target.value)}
                        className="w-full border-gray-600 rounded-md bg-gray-900 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                        <option value="">{t.allDevices}</option>
                        <option value="mobile">Mobile</option>
                        <option value="desktop">Desktop</option>
                        <option value="tablet">Tablet</option>
                    </select>
                    <p className="mt-2 text-xs text-gray-400">{t.deviceHint}</p>
                </div>

                <div>
                    <label htmlFor="source" className="block text-sm font-medium text-gray-300 mb-1">
                        {t.source}
                    </label>
                    <select
                        id="source"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full border-gray-600 rounded-md bg-gray-900 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                        <option value="">{t.allSources}</option>
                        {availableSources.map((src) => (
                            <option key={src} value={src}>
                                {src}
                            </option>
                        ))}
                    </select>
                </div>
            </div>


            {loading && (
                <div className="py-8 text-center text-gray-400 flex justify-center items-center gap-2">
                    <span className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full"></span>
                    {t.loading}
                </div>
            )}
            {error && <div className="text-red-400 text-sm my-4">{error}</div>}
            {!loading && !error && stats.length === 0 && (
                <div className="text-gray-400 text-sm my-4">{t.noData}</div>
            )}


            {!loading && !error && stats.length > 0 && (
                <div className="mt-6 bg-gray-900 p-4 rounded-lg shadow-inner">
                    <MetricsChart stats={stats} />
                </div>
            )}

            <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{t.deviceMetrics}</h3>
                </div>
                {deviceTotals.length === 0 ? (
                    <p className="text-sm text-gray-400">{t.deviceTotalsEmpty}</p>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {deviceTotals.map((device) => (
                            <div
                                key={device.deviceType}
                                className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 shadow-sm text-gray-100"
                            >
                                <p className="text-sm font-semibold">{formatDeviceLabel(device.deviceType)}</p>
                                <p className="text-xs text-gray-400">{t.deviceType}</p>
                                <p className="mt-1 text-2xl font-bold text-white">{device.clicks.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{t.sourceMetrics}</h3>
                </div>
                {sourceTotals.length === 0 ? (
                    <p className="text-sm text-gray-400">{t.sourceTotalsEmpty}</p>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {sourceTotals.map((entry) => (
                            <div
                                key={entry.source}
                                className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 shadow-sm text-gray-100"
                            >
                                <p className="text-sm font-semibold">{entry.source}</p>
                                <p className="text-xs text-gray-400">{t.source}</p>
                                <p className="mt-1 text-2xl font-bold text-white">{entry.clicks.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{t.countryMetrics}</h3>
                    {countryLoading && <span className="text-xs text-gray-400 animate-pulse">{t.loading}</span>}
                </div>
                {availableCountries.length === 0 ? (
                    <p className="text-sm text-gray-400">{t.countryTotalsEmpty}</p>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {availableCountries.map((code) => (
                            <button
                                key={code}
                                onClick={() => setCountry(code === country ? '' : code)}
                                className={`flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left transition ${
                                    country === code
                                        ? 'border-blue-500 bg-blue-500/10 text-white'
                                        : 'border-gray-700 bg-gray-900 text-gray-200 hover:border-gray-500'
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
