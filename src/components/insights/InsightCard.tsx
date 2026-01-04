/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowUpRight, ArrowDownRight, } from 'lucide-react';

interface InsightCardProps {
    insight: any;
    onClick: () => void;
}

export function InsightCard({ insight, onClick }: InsightCardProps) {
    const typeColors: Record<string, { bg: string; border: string; icon: string }> = {
        positive: {
            bg: 'bg-emerald-500/5 hover:bg-emerald-500/10',
            border: 'border-emerald-500/20',
            icon: 'text-emerald-400'
        },
        opportunity: {
            bg: 'bg-blue-500/5 hover:bg-blue-500/10',
            border: 'border-blue-500/20',
            icon: 'text-blue-400'
        },
        warning: {
            bg: 'bg-yellow-500/5 hover:bg-yellow-500/10',
            border: 'border-yellow-500/20',
            icon: 'text-yellow-400'
        },
        critical: {
            bg: 'bg-red-500/5 hover:bg-red-500/10',
            border: 'border-red-500/20',
            icon: 'text-red-400'
        },
        info: {
            bg: 'bg-gray-500/5 hover:bg-gray-500/10',
            border: 'border-gray-500/20',
            icon: 'text-gray-400'
        }
    };

    const colors = typeColors[insight.type] || typeColors.info;
    const Icon = insight.icon;

    return (
        <button
            onClick={onClick}
            className={`
                w-full text-left p-4 rounded-xl border transition-all
                ${colors.bg} ${colors.border}
                hover:scale-[1.02] hover:shadow-lg
                group cursor-pointer
            `}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className={`p-2 rounded-lg ${colors.bg} ${colors.icon}`}>
                    <Icon size={20} />
                </div>

                {insight.metricDelta !== undefined && (
                    <div className={`flex items-center gap-1 text-xs ${colors.icon}`}>
                        {insight.metricDelta >= 0 ? (
                            <ArrowUpRight size={14} />
                        ) : (
                            <ArrowDownRight size={14} />
                        )}
                        <span className="font-semibold">
                            {Math.abs(insight.metricDelta).toFixed(1)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Title */}
            <h3 className="text-white font-semibold mb-1 group-hover:text-emerald-400 transition-colors">
                {insight.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-400 line-clamp-2">
                {insight.description}
            </p>

            {/* Footer with metric */}
            {insight.metricValue !== undefined && (
                <div className="mt-3 pt-3 border-t border-gray-800/50 flex items-center justify-between">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                        {insight.category}
                    </span>
                    <span className={`text-sm font-semibold ${colors.icon}`}>
                        {formatMetricValue(insight.metricValue, insight.metricUnit)}
                    </span>
                </div>
            )}

            {/* Priority indicator (subtle) */}
            <div className="mt-2 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${i < Math.floor(insight.priority / 20)
                                ? colors.icon.replace('text-', 'bg-')
                                : 'bg-gray-800'
                            }`}
                    />
                ))}
            </div>
        </button>
    );
}

function formatMetricValue(value: number, unit?: string): string {
    if (unit === 'percent') return `${value.toFixed(1)}%`;
    if (unit === 'count') return value.toLocaleString();
    if (value > 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toFixed(0);
}