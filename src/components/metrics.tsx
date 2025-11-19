/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import MetricsChart from './MetricsChart';
import { SupportedLanguage } from '@/types/i18n';

interface Stat {
    _id: { year: number; month: number; day: number };
    clicks: number;
}

interface StatsResponse {
    stats: Stat[];
}

interface CountryMetric {
    country: string;
    clicks: number;
}

interface SummaryResponse {
    totalClicks: number;
    countries: string[];
    countryMetrics?: CountryMetric[];
}

const translations: Record<SupportedLanguage, { [key: string]: string }> = {
    en: {
        title: 'Link metrics',
        total: 'Total clicks',
        from: 'From',
        to: 'To',
        country: 'Country',
        all: 'All',
        loading: 'Loading stats...',
        noData: 'No data available to display.',
        dateError: 'The date range is invalid',
        countryMetrics: 'Top countries',
        countryClicks: 'clicks',
        emptyCountries: 'No country information yet',
    },
    es: {
        title: 'Métricas del enlace',
        total: 'Total de clics',
        from: 'Desde',
        to: 'Hasta',
        country: 'País',
        all: 'Todos',
        loading: 'Cargando estadísticas...',
        noData: 'No hay datos para mostrar.',
        dateError: 'El rango de fechas es inválido',
        countryMetrics: 'Principales países',
        countryClicks: 'clics',
        emptyCountries: 'Aún no hay información por país',
    },
};

const MAX_COUNTRY_ROWS = 5;

export default function Metrics({ linkId, language = 'en' }: { linkId: string; language?: SupportedLanguage }) {
    const t = translations[language];
    const [stats, setStats] = useState<Stat[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [totalClicks, setTotalClicks] = useState(0);
    const [availableCountries, setAvailableCountries] = useState<string[]>([]);
    const [countryMetrics, setCountryMetrics] = useState<CountryMetric[]>([]);

    const [startDate, setStartDate] = useState(() => {
        const d = new Date(Date.now() - 7 * 24 * 3600 * 1000);
        return d.toISOString().slice(0, 10);
    });
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        return d.toISOString().slice(0, 10);
    });
    const [country, setCountry] = useState('');

    const countryRows = useMemo(() => countryMetrics.slice(0, MAX_COUNTRY_ROWS), [countryMetrics]);

    // Fetch resumen total (totalClicks y countries)
    useEffect(() => {
        async function fetchSummary() {
            try {
                const res = await fetch(`/api/metrics/summary?linkId=${linkId}`);
                if (!res.ok) throw new Error('Error fetching summary');
                const data: SummaryResponse = await res.json();
                setTotalClicks(data.totalClicks || 0);
                setAvailableCountries(data.countries || []);
                setCountryMetrics(data.countryMetrics || []);
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
                });
                if (country) params.append('country', country);

                const res = await fetch(`/api/metrics?${params.toString()}`);
                if (!res.ok) throw new Error('Error fetching stats');
                const data: StatsResponse = await res.json();
                setStats(data.stats);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (startDate && endDate && new Date(startDate) <= new Date(endDate)) {
            fetchStats();
        } else {
            setStats([]);
            setError(t.dateError);
        }
    }, [linkId, startDate, endDate, country, t]);

    return (
        <div className="space-y-6 rounded-xl border border-gray-700 bg-gray-900/70 p-6 shadow-lg">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-400">{t.title}</p>
                    <h2 className="text-2xl font-bold text-white">{t.total}</h2>
                </div>
                <div className="rounded-lg bg-blue-600/15 px-4 py-2 text-3xl font-black text-white shadow-inner shadow-blue-500/30">
                    {totalClicks}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">
                        {t.from}
                    </label>
                    <input
                        id="startDate"
                        type="date"
                        value={startDate}
                        max={endDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-300">
                        {t.to}
                    </label>
                    <input
                        id="endDate"
                        type="date"
                        value={endDate}
                        min={startDate}
                        max={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="country" className="block text-sm font-medium text-gray-300">
                        {t.country}
                    </label>
                    <select
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full appearance-none rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">{t.all}</option>
                        {availableCountries.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                <div className="rounded-lg bg-gray-900 p-4 shadow-inner">
                    {loading && (
                        <div className="flex items-center justify-center gap-2 py-8 text-gray-400">
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-white"></span>
                            {t.loading}
                        </div>
                    )}
                    {error && <div className="my-4 text-sm text-red-400">{error}</div>}
                    {!loading && !error && stats.length === 0 && (
                        <div className="my-4 text-sm text-gray-400">{t.noData}</div>
                    )}

                    {!loading && !error && stats.length > 0 && (
                        <div className="mt-2 rounded-lg bg-gray-900 p-2">
                            <MetricsChart stats={stats} />
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3 rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">{t.countryMetrics}</h3>
                        <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-200">
                            {countryMetrics.length}
                        </span>
                    </div>
                    {countryRows.length === 0 && <p className="text-sm text-gray-400">{t.emptyCountries}</p>}
                    {countryRows.map((entry) => (
                        <div key={entry.country} className="rounded-md border border-gray-800 bg-gray-900/70 p-3">
                            <div className="flex items-center justify-between text-sm text-gray-200">
                                <span className="font-semibold">{entry.country}</span>
                                <span className="text-xs uppercase text-gray-400">{t.countryClicks}</span>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <div className="h-2 flex-1 rounded-full bg-gray-800">
                                    <div
                                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                                        style={{ width: `${Math.min(100, (entry.clicks / (countryMetrics[0]?.clicks || 1)) * 100)}%` }}
                                    />
                                </div>
                                <span className="w-14 text-right text-sm text-white">{entry.clicks}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
