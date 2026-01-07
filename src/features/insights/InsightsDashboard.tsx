/* eslint-disable @typescript-eslint/no-explicit-any */
//insightsDashboard.tsx
'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/shared/ui';
import { useInsightsDashboard } from './hooks/useInsightsDashboard';
import { InsightCard } from './components/InsightCard';
import { InsightDetail } from './components/InsightDetail';
import { LoadingState, EmptyState } from './components/LoadingState';
import { InsightsHeader } from './components/InsightsHeader';
import { InsightsFilters } from './components/InsightsFilters';

export default function InsightsDashboard() {
  const t = useTranslations('insights');
  const {
    period,
    setPeriod,
    response,
    loading,
    error,
    refetch,
    selectedInsight,
    setSelectedInsight,
    categoryFilter,
    setCategoryFilter,
    isRefreshing,
    filteredInsights,
    stats,
    handleRefresh,
  } = useInsightsDashboard();

  // Loading states
  if (loading && !response) {
    return <LoadingState message={t('loadingInsights')} />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          <span>{t('loadError')}</span>
        </div>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  // Pending/Calculating states
  if (response?.status === 'pending' || response?.status === 'calculating') {
    const isPending = response.status === 'pending';
    return (
      <LoadingState
        message={isPending ? t('generatingInsights') : t('calculatingInsights')}
        submessage={t('estimatedWaitTime', { seconds: response.estimatedWaitTime ?? 0 })}
        showSpinner
      />
    );
  }

  // Error state
  if (response?.status === 'error') {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          <span>{response.error || t('unknownError')}</span>
        </div>
        <p className="text-sm text-gray-400">{response.message}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  // Empty state
  if (filteredInsights.length === 0 && categoryFilter === 'all') {
    return <EmptyState onRefresh={handleRefresh} />;
  }

  return (
    <div className="space-y-6">
      {/* Header con stats */}
      <InsightsHeader
        stats={stats}
        period={period}
        setPeriod={setPeriod}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      {/* Type summary badges */}
      {stats && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.byType).map(([type, count]: [string, any]) => {
            const variants: Record<string, 'emerald' | 'blue' | 'amber' | 'red' | 'gray'> = {
              positive: 'emerald',
              opportunity: 'blue',
              warning: 'amber',
              critical: 'red',
              info: 'gray',
            };

            return (
              <Badge key={type} variant={variants[type] || 'gray'}>
                {count} {t(`type.${type}`)}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Category filter */}
      <InsightsFilters
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        stats={stats}
      />

      {/* Insights grid */}
      {filteredInsights.length === 0 ? (
        <div className="text-center py-12 text-gray-400">{t('emptyCategory')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInsights.map((insight: any) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onClick={() => setSelectedInsight(insight)}
            />
          ))}
        </div>
      )}

      {/* Detail panel */}
      {selectedInsight && (
        <InsightDetail insight={selectedInsight} onClose={() => setSelectedInsight(null)} />
      )}
    </div>
  );
}

