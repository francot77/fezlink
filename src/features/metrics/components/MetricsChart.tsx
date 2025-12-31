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
    BarChart,
    Bar,
} from 'recharts';
import { TrendingUp, CalendarDays } from 'lucide-react';

interface Stat {
    _id: string;
    clicks: number;
    displayDate?: string;
    isMonthly?: boolean;
}

interface MetricsChartProps {
    stats: Stat[];
    chartType?: 'line' | 'bar';
    isMonthly?: boolean;
}

export default function MetricsChart({ stats, chartType = 'line', isMonthly = false }: MetricsChartProps) {
    const formatMonthlyDate = (dateStr: string) => {
        const [month] = dateStr.split('-');
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${monthNames[parseInt(month) - 1]}`;
    };

    const formatDailyDate = (dateStr: string) => {
        const [month, day] = dateStr.split('-');
        return `${day}/${month}`;
    };

    const formatTooltipDate = (dateStr: string, isMonthly: boolean) => {
        if (isMonthly) {
            const [year, month] = dateStr.split('-');
            const monthNames = [
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ];
            return `${monthNames[parseInt(month) - 1]} ${year}`;
        }
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const data = stats.map((stat) => {
        const displayDate = stat.displayDate ||
            (isMonthly ? formatMonthlyDate(stat._id) : formatDailyDate(stat._id));

        const fullDate = formatTooltipDate(stat._id, stat.isMonthly || isMonthly);

        return {
            date: displayDate,
            fullDate,
            clicks: stat.clicks,
            rawDate: stat._id,
            isMonthly: stat.isMonthly || isMonthly,
        };
    });

    const maxClicks = Math.max(...data.map(d => d.clicks), 0);
    const totalClicks = data.reduce((sum, d) => sum + d.clicks, 0);
    const avgClicks = data.length > 0 ? Math.round(totalClicks / data.length) : 0;
    const peakDate = data.find(d => d.clicks === maxClicks)?.fullDate || '';

    const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
        if (!active || !payload?.length) return null;

        const clicks = payload[0].value || 0;
        const date = payload[0].payload.fullDate;
        const isMonthlyData = payload[0].payload.isMonthly;

        return (
            <div className="relative overflow-hidden rounded-xl border border-white/20 bg-gray-900/95 backdrop-blur-xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" />
                <div className="relative px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-400">{date}</p>
                        {isMonthlyData && (
                            <span className="flex items-center gap-1 text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                                <CalendarDays size={10} />
                                Mensual
                            </span>
                        )}
                    </div>
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

    const renderChart = () => {
        if (chartType === 'bar') {
            return (
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.8} />
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
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Bar
                        dataKey="clicks"
                        fill="url(#barGradient)"
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                    />
                </BarChart>
            );
        }

        // Default to area chart
        return (
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
        );
    };

    return (
        <div className="space-y-4">
            {/* Stats summary */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-gradient-to-br from-emerald-500/10 to-green-500/10 px-3 py-2 ring-1 ring-white/10">
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-lg font-bold text-white">{totalClicks.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 px-3 py-2 ring-1 ring-white/10">
                    <p className="text-xs text-gray-400">Promedio</p>
                    <p className="text-lg font-bold text-white">{avgClicks.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 px-3 py-2 ring-1 ring-white/10">
                    <p className="text-xs text-gray-400">Máximo</p>
                    <p className="text-lg font-bold text-white">{maxClicks.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-orange-500/10 to-yellow-500/10 px-3 py-2 ring-1 ring-white/10">
                    <p className="text-xs text-gray-400">
                        {isMonthly ? 'Mes pico' : 'Día pico'}
                    </p>
                    <p className="text-sm font-bold text-white truncate" title={peakDate}>
                        {peakDate}
                    </p>
                </div>
            </div>

            {/* Chart type indicator */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {isMonthly && (
                        <div className="flex items-center gap-1.5 rounded-full bg-purple-500/20 px-3 py-1">
                            <CalendarDays size={12} className="text-purple-400" />
                            <span className="text-xs font-medium text-purple-300">Datos mensuales</span>
                        </div>
                    )}
                </div>
                <div className="text-sm text-gray-400">
                    {chartType === 'bar' ? 'Gráfico de barras' : 'Gráfico de líneas'}
                </div>
            </div>

            {/* Chart */}
            <div className="rounded-xl bg-gradient-to-br from-gray-900/40 to-black/40 p-4 ring-1 ring-white/5">
                <ResponsiveContainer width="100%" height={320}>
                    {renderChart()}
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${chartType === 'bar'
                        ? 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                        : 'bg-gradient-to-r from-emerald-500/40 to-cyan-500/40'
                        }`} />
                    <span>Clicks totales</span>
                </div>
                {isMonthly && (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-purple-500/40" />
                        <span>Datos agregados por mes</span>
                    </div>
                )}
            </div>
        </div>
    );
}