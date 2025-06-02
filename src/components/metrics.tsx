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

    // Fetch estadísticas por día
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
        <div className="p-4 bg-gray-700 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Métricas del enlace</h2>
            <p className="text-xl text-white mb-2">
                Total de clics: <strong>{totalClicks}</strong>
            </p>
            <span>Filtrar</span>
            <div className="mb-4 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium mb-1">Desde</label>
                    <input
                        type="date"
                        value={startDate}
                        max={endDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border rounded px-2 py-1 bg-white text-black"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Hasta</label>
                    <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        max={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border rounded px-2 py-1 bg-white text-black"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">País</label>
                    <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="border rounded px-2 py-1 bg-white text-black"
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



            {loading && <div className="text-sm">Cargando estadísticas...</div>}
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {!loading && !error && stats.length === 0 && <div>No hay datos para mostrar.</div>}


            <MetricsChart stats={stats} />
        </div>
    );
}
