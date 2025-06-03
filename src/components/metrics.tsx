/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import MetricsChart from './MetricsChart';

interface Stat {
    _id: { year: number; month: number; day: number };
    clicks: number;
}

interface StatsResponse {
    stats: Stat[];
}

export default function Metrics({ linkId }: { linkId: string }) {
    const [stats, setStats] = useState<Stat[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [totalClicks, setTotalClicks] = useState(0);
    const [availableCountries, setAvailableCountries] = useState<string[]>([]);

    const [startDate, setStartDate] = useState(() => {
        const d = new Date(Date.now() - 7 * 24 * 3600 * 1000);
        return d.toISOString().slice(0, 10);
    });
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        return d.toISOString().slice(0, 10);
    });
    const [country, setCountry] = useState('');

    // Fetch resumen total (totalClicks y countries)
    useEffect(() => {
        async function fetchSummary() {
            try {
                const res = await fetch(`/api/metrics/summary?linkId=${linkId}`);
                if (!res.ok) throw new Error('Error fetching summary');
                const data = await res.json();
                console.log(data)
                setTotalClicks(data.totalClicks || 0);
                setAvailableCountries(data.countries || []);
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
            setError('El rango de fechas es inválido');
        }
    }, [linkId, startDate, endDate, country]);

    return (
        <div className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-white">Métricas del enlace</h2>


            <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 mb-6 backdrop-blur-sm w-fit">
                <p className="text-lg text-gray-300">Total de clics:</p>
                <p className="text-4xl font-extrabold text-white">{totalClicks}</p>
            </div>


            <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">

                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">
                        Desde
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
                        Hasta
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
                        País
                    </label>
                    <select
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full border-gray-600 rounded-md bg-gray-900 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                        <option value="">Todos</option>
                        {availableCountries.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>
            </div>


            {loading && (
                <div className="py-8 text-center text-gray-400 flex justify-center items-center gap-2">
                    <span className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full"></span>
                    Cargando estadísticas...
                </div>
            )}
            {error && <div className="text-red-400 text-sm my-4">{error}</div>}
            {!loading && !error && stats.length === 0 && (
                <div className="text-gray-400 text-sm my-4">No hay datos para mostrar.</div>
            )}


            {!loading && !error && stats.length > 0 && (
                <div className="mt-6 bg-gray-900 p-4 rounded-lg shadow-inner">
                    <MetricsChart stats={stats} />
                </div>
            )}
        </div>
    );
}
