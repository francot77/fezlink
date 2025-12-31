import React from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { Trend } from '../types/metrics';

interface TrendBadgeProps {
    trend?: Trend;
    labels: {
        trendNew: string;
        trendNoData: string;
    };
}

export const TrendBadge: React.FC<TrendBadgeProps> = ({ trend, labels }) => {
    if (!trend) return null;

    if (!trend.hasEnoughData) {
        return (
            <div className="flex items-center gap-1.5 rounded-full bg-gray-700/40 px-2.5 py-1">
                <Minus size={12} className="text-gray-400" />
                <span className="text-xs font-semibold text-gray-400">{labels.trendNoData}</span>
            </div>
        );
    }

    const percentText = trend.changePercent ?? 0;
    const isNegative = percentText < 0;
    const isNew = trend.changePercent === null;

    if (isNew) {
        return (
            <div className="flex items-center gap-1.5 rounded-full bg-purple-500/20 px-2.5 py-1 ring-1 ring-purple-500/30">
                <Sparkles size={12} className="text-purple-400" />
                <span className="text-xs font-semibold text-purple-300">{labels.trendNew}</span>
            </div>
        );
    }

    const Icon = isNegative ? TrendingDown : TrendingUp;
    const colorClasses = isNegative
        ? 'bg-red-500/20 text-red-300 ring-red-500/30'
        : 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30';

    return (
        <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ring-1 ${colorClasses}`}>
            <Icon size={12} />
            <span className="text-xs font-semibold">
                {percentText > 0 ? '+' : ''}{percentText}%
            </span>
        </div>
    );
};