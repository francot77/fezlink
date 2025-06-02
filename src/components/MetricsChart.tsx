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
} from 'recharts';

interface Stat {
    _id: { year: number; month: number; day: number };
    clicks: number;
}

export default function MetricsChart({ stats }: { stats: Stat[] }) {
    const data = stats.map((stat) => {
        const { year, month, day } = stat._id;
        const date = new Date(year, month - 1, day).toLocaleDateString();
        return { date, clicks: stat.clicks };
    });

    if (data.length === 0) return null;

    return (
        <div className="mt-6">
            <h3 className="text-md font-semibold mb-2">Evolución de clics</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="clicks" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
