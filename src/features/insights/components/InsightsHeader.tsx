/* eslint-disable no-unused-vars */
import { RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface InsightsHeaderProps {
  stats: {
    total: number;
    totalClicks: number;
    totalLinks: number;
  } | null;
  period: '7d' | '30d' | '90d' | 'yearly';
  setPeriod: (p: '7d' | '30d' | '90d' | 'yearly') => void;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function InsightsHeader({
  stats,
  period,
  setPeriod,
  isRefreshing,
  onRefresh,
}: InsightsHeaderProps) {
  const t = useTranslations('insights');

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-white">{t('title')}</h2>
        <p className="text-sm text-gray-400 mt-1">
          {stats?.total} {t('insightsDetected')} • {stats?.totalClicks.toLocaleString()} {t('clicks')} • {stats?.totalLinks} {t('links')}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Period selector */}
        <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
          {(['7d', '30d', '90d', 'yearly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${period === p
                ? 'bg-emerald-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
            >
              {p === 'yearly' ? t('oneYear') : p}
            </button>
          ))}
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all disabled:opacity-50"
          title={`${t('refreshInsights')} - ${t('dailyLimitInfo')}`}
        >
          <RefreshCw
            size={18}
            className={`text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </button>
      </div>
    </div>
  );
}
