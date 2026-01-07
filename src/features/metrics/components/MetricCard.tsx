import React from 'react';
import { TrendBadge } from './TrendBadge';
import { Trend } from '../types/metrics';
import { GlassCard } from '@/shared/ui';

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

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  subtitle,
  value,
  trend,
  accentColor,
  trendLabels,
}) => {
  return (
    <GlassCard accentColor={accentColor} hoverEffect className="p-5">
      <div className="space-y-3">
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
    </GlassCard>
  );
};

