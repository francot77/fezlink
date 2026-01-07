/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatMetricValue } from '@/features/metrics/utils/format';
import { typeColorsCard } from '@/features/metrics/constants/typeColors';
import { GlassCard } from '@/shared/ui';

interface InsightCardProps {
  insight: any;
  onClick: () => void;
}

export function InsightCard({ insight, onClick }: InsightCardProps) {
  const colors = typeColorsCard[insight.type] || typeColorsCard.info;
  const Icon = insight.icon;

  const accentMap: Record<string, 'emerald' | 'blue' | 'yellow' | 'red' | 'none'> = {
    positive: 'emerald',
    opportunity: 'blue',
    warning: 'yellow',
    critical: 'red',
    info: 'none',
  };

  const accent = accentMap[insight.type] || 'none';

  return (
    <GlassCard
      as="button"
      onClick={onClick}
      accentColor={accent}
      hoverEffect
      className="w-full text-left p-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colors.bg} ${colors.icon}`}>
          <Icon size={20} />
        </div>

        {insight.metricDelta !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${colors.icon}`}>
            {insight.metricDelta >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span className="font-semibold">{Math.abs(insight.metricDelta).toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold mb-1 group-hover:text-emerald-400 transition-colors">
        {insight.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-400 line-clamp-2">{insight.description}</p>

      {/* Footer with metric */}
      {insight.metricValue !== undefined && (
        <div className="mt-3 pt-3 border-t border-gray-800/50 flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-wider">{insight.category}</span>
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
            className={`h-1 flex-1 rounded-full transition-all ${
              i < Math.floor(insight.priority / 20)
                ? colors.icon.replace('text-', 'bg-')
                : 'bg-gray-800'
            }`}
          />
        ))}
      </div>
    </GlassCard>
  );
}


// formatMetricValue centralizado en features/metrics/utils/format
