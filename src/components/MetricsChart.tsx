'use client';
import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    TooltipProps,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface Stat {
    _id: string;
    clicks: number;
}

export default function MetricsChart({ stats }: { stats: Stat[] }) {
    const data = stats.map((stat) => {
        const [year, month, day] = stat._id.split('-').map(Number);

        const label = `${day}/${month}`; // o locale si querés
        const fullDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        return {
            date: label,
            fullDate,
            clicks: stat.clicks,
        };
    });


    const maxClicks = Math.max(...data.map(d => d.clicks), 0);
    const totalClicks = data.reduce((sum, d) => sum + d.clicks, 0);
    const avgClicks = data.length > 0 ? Math.round(totalClicks / data.length) : 0;

    const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
        if (!active || !payload?.length) return null;

        const clicks = payload[0].value || 0;
        const date = payload[0].payload.fullDate;

        return (
            <div className="relative overflow-hidden rounded-xl border border-white/20 bg-gray-900/95 backdrop-blur-xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" />
                <div className="relative px-4 py-3 space-y-2">
                    <p className="text-xs font-medium text-gray-400">{date}</p>
                    <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-emerald-400" />
                        <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            {clicks}
                        </p>
                        <span className="text-sm text-gray-400">clicks</span>
                    </div>
                </div>
            </div>
        );
    };

    if (data.length === 0) return null;

    return (
        <div className="space-y-4">
            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-gradient-to-br from-emerald-500/10 to-green-500/10 px-3 py-2 ring-1 ring-white/10">
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-lg font-bold text-white">{totalClicks.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 px-3 py-2 ring-1 ring-white/10">
                    <p className="text-xs text-gray-400">Average</p>
                    <p className="text-lg font-bold text-white">{avgClicks.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 px-3 py-2 ring-1 ring-white/10">
                    <p className="text-xs text-gray-400">Peak</p>
                    <p className="text-lg font-bold text-white">{maxClicks.toLocaleString()}</p>
                </div>
            </div>

            {/* Chart */}
            <div className="rounded-xl bg-gradient-to-br from-gray-900/40 to-black/40 p-4 ring-1 ring-white/5">
                <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                                <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="50%" stopColor="#06b6d4" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.05)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            tickLine={false}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <YAxis
                            allowDecimals={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            tickLine={false}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{
                                stroke: '#10b981',
                                strokeWidth: 2,
                                strokeDasharray: '5 5',
                                opacity: 0.3
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="clicks"
                            stroke="url(#strokeGradient)"
                            strokeWidth={3}
                            fill="url(#clicksGradient)"
                            dot={{
                                r: 4,
                                fill: '#0f172a',
                                strokeWidth: 2,
                                stroke: '#10b981'
                            }}
                            activeDot={{
                                r: 6,
                                fill: '#10b981',
                                stroke: '#0f172a',
                                strokeWidth: 2,
                                filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))'
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}