import React from 'react';
import { TrendBadge } from './TrendBadge';
import { Trend } from '../types/metrics';

interface MetricCardProps {
    icon: string;
    label: string;
    subtitle: string;
    value: number;
    trend?: Trend;
    accentColor: 'cyan' | 'emerald' | 'purple';
    trendLabels: {
        trendNew: string;
        trendNoData: string;
    };
}

const accentColors = {
    cyan: {
        border: 'hover:border-cyan-400/60 hover:shadow-cyan-500/10',
        bg: 'from-cyan-500/5 via-transparent to-blue-500/5'
    },
    emerald: {
        border: 'hover:border-emerald-400/60 hover:shadow-emerald-500/10',
        bg: 'from-emerald-500/5 via-transparent to-green-500/5'
    },
    purple: {
        border: 'hover:border-purple-400/60 hover:shadow-purple-500/10',
        bg: 'from-purple-500/5 via-transparent to-pink-500/5'
    }
};

export const MetricCard: React.FC<MetricCardProps> = ({
    icon,
    label,
    subtitle,
    value,
    trend,
    accentColor,
    trendLabels
}) => {
    const colors = accentColors[accentColor];

    return (
        <div className={`group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-xl ${colors.border}`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
            <div className="relative p-5 space-y-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{icon}</span>
                        <div>
                            <p className="text-sm font-semibold text-white">{label}</p>
                            <p className="text-xs text-gray-500">{subtitle}</p>
                        </div>
                    </div>
                    <TrendBadge trend={trend} labels={trendLabels} />
                </div>
                <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
            </div>
        </div>
    );
};