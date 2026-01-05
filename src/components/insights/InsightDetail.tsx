/* eslint-disable @typescript-eslint/no-explicit-any */
import { X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { MiniChart } from './MiniChart';
import { createPortal } from 'react-dom';

interface InsightDetailProps {
    insight: any;
    onClose: () => void;
}

export function InsightDetail({ insight, onClose }: InsightDetailProps) {
    if (typeof window === 'undefined') return null;
    const Icon = insight.icon;

    const typeColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
        positive: {
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            text: 'text-emerald-400',
            badge: 'bg-emerald-500/20 text-emerald-400'
        },
        opportunity: {
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            text: 'text-blue-400',
            badge: 'bg-blue-500/20 text-blue-400'
        },
        warning: {
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/20',
            text: 'text-yellow-400',
            badge: 'bg-yellow-500/20 text-yellow-400'
        },
        critical: {
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            text: 'text-red-400',
            badge: 'bg-red-500/20 text-red-400'
        },
        info: {
            bg: 'bg-gray-500/10',
            border: 'border-gray-500/20',
            text: 'text-gray-400',
            badge: 'bg-gray-500/20 text-gray-400'
        }
    };

    const colors = typeColors[insight.type] || typeColors.info;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0b1224] rounded-xl border border-gray-800 shadow-2xl">
                {/* Header */}
                <div className={`sticky top-0 p-6 border-b ${colors.border} ${colors.bg} backdrop-blur-sm`}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${colors.bg} ${colors.text}`}>
                                <Icon size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-xl font-bold text-white">
                                        {insight.title}
                                    </h3>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${colors.badge}`}>
                                        {insight.type}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400">
                                    {insight.description}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Primary Metric */}
                    {insight.metricValue !== undefined && (
                        <div className={`p-4 rounded-xl border ${colors.border} ${colors.bg}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Valor Principal</p>
                                    <p className={`text-3xl font-bold ${colors.text}`}>
                                        {formatMetricValue(insight.metricValue, insight.metricUnit)}
                                    </p>
                                </div>

                                {insight.metricDelta !== undefined && (
                                    <div className={`flex flex-col items-end`}>
                                        <div className={`flex items-center gap-1 ${colors.text}`}>
                                            {insight.metricDelta >= 0 ? (
                                                <ArrowUpRight size={20} />
                                            ) : (
                                                <ArrowDownRight size={20} />
                                            )}
                                            <span className="text-2xl font-bold">
                                                {Math.abs(insight.metricDelta).toFixed(1)}%
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            vs período anterior
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Chart */}
                    {insight.chartData && insight.chartData.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-white mb-3">
                                Tendencia
                            </h4>
                            <div className={`p-4 rounded-xl border ${colors.border} bg-gray-900/50`}>
                                <MiniChart data={insight.chartData} color={colors.text} />
                            </div>
                        </div>
                    )}

                    {/* Detail Text */}
                    {insight.detail && (
                        <div>
                            <h4 className="text-sm font-semibold text-white mb-2">
                                Detalles
                            </h4>
                            <p className="text-gray-300 leading-relaxed">
                                {insight.detail}
                            </p>
                        </div>
                    )}

                    {/* Metadata */}
                    {insight.metadata && Object.keys(insight.metadata).length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-white mb-3">
                                Información Adicional
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(insight.metadata).map(([key, value]: [string, any]) => (
                                    <div
                                        key={key}
                                        className="p-3 rounded-lg bg-gray-800/50 border border-gray-700"
                                    >
                                        <p className="text-xs text-gray-500 mb-1">
                                            {formatMetadataKey(key)}
                                        </p>
                                        <p className="text-sm text-white font-medium">
                                            {formatMetadataValue(value)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Related IDs */}
                    {insight.relatedIds && insight.relatedIds.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-white mb-3">
                                Elementos Relacionados
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {insight.relatedIds.map((id: string, i: number) => (
                                    <div
                                        key={i}
                                        className={`px-3 py-1.5 rounded-lg border ${colors.border} ${colors.bg} text-sm ${colors.text}`}
                                    >
                                        {id}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Priority and Category */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Prioridad</p>
                            <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full ${i < Math.floor(insight.priority / 20)
                                            ? colors.text.replace('text-', 'bg-')
                                            : 'bg-gray-700'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="h-8 w-px bg-gray-800" />

                        <div>
                            <p className="text-xs text-gray-500 mb-1">Categoría</p>
                            <p className="text-sm text-white capitalize">
                                {insight.category}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        , document.body);
}

function formatMetricValue(value: number, unit?: string): string {
    if (unit === 'percent') return `${value.toFixed(1)}%`;
    if (unit === 'count') return value.toLocaleString();
    if (value > 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toFixed(0);
}

function formatMetadataKey(key: string): string {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
}

function formatMetadataValue(value: any): string {
    if (typeof value === 'number') {
        if (value > 1000) return value.toLocaleString();
        return value.toFixed(0);
    }
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    return String(value);
}