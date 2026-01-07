'use client';

import { BarChart3, Link as LinkIcon, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

const AnimatedCounter = ({ value, duration = 1000 }: { value: number; duration?: number }) => {
  const count = useMemo(() => value, [value]);
  return <>{count.toLocaleString()}</>;
};

interface Stat {
  label: string;
  value: number;
  icon: any;
  gradient: string;
  iconColor: string;
}

interface StatsGridProps {
  linksCount: number;
  totalClicks: number;
}

const StatsGrid: React.FC<StatsGridProps> = ({ linksCount, totalClicks }) => {
  const tLinks = useTranslations('links');
  const stats: Stat[] = [
    {
      label: tLinks('activeLinks'),
      value: linksCount,
      icon: LinkIcon,
      gradient: 'from-emerald-500/20 to-green-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      label: tLinks('totalClicks'),
      value: totalClicks,
      icon: TrendingUp,
      gradient: 'from-cyan-500/20 to-blue-500/20',
      iconColor: 'text-cyan-400',
    },
    {
      label: tLinks('averagePerLink'),
      value: linksCount === 0 ? 0 : Math.round(totalClicks / linksCount),
      icon: BarChart3,
      gradient: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-xl animate-in fade-in slide-in-from-top-4"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
            <div className="relative p-4 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                <div className="rounded-lg bg-white/5 p-2 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110">
                  <Icon size={18} className={stat.iconColor} />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-white">
                <AnimatedCounter value={stat.value} />
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsGrid;

