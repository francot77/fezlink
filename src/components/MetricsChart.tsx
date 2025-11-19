'use client';
import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    TooltipProps,
} from 'recharts';

interface Stat {
    _id: { year: number; month: number; day: number };
    clicks: number;
}

export default function MetricsChart({ stats }: { stats: Stat[] }) {
    const data = stats.map((stat) => {
        const { year, month, day } = stat._id;
        const date = new Date(year, month - 1, day).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
        });
        return { date, clicks: stat.clicks };
    });

    const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="rounded-lg border border-gray-700 bg-gray-900/90 px-3 py-2 text-xs shadow-lg">
                <p className="text-gray-300">{label}</p>
                <p className="font-semibold text-white">{payload[0].value} clicks</p>
            </div>
        );
    };

    if (data.length === 0) return null;

    return (
        <div className="mt-2">
            <ResponsiveContainer width="100%" height={320}>
                <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1f2937' }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1f2937' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#60a5fa', strokeWidth: 1, strokeDasharray: '5 5' }} />
                    <Line
                        type="monotone"
                        dataKey="clicks"
                        stroke="#60a5fa"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#1f2937', strokeWidth: 2, stroke: '#60a5fa' }}
                        activeDot={{ r: 6, fill: '#60a5fa', stroke: '#111827', strokeWidth: 2 }}
                        fillOpacity={1}
                        fill="url(#clicksGradient)"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
