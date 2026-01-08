/* eslint-disable @typescript-eslint/no-explicit-any */
//insightsDashboard.tsx
'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/shared/ui';
import { Sparkles, Lock } from 'lucide-react';
import { useInsightsDashboard } from './hooks/useInsightsDashboard';
import { InsightCard } from './components/InsightCard';
import { InsightDetail } from './components/InsightDetail';
import { LoadingState, EmptyState } from './components/LoadingState';
import { InsightsHeader } from './components/InsightsHeader';
import { InsightsFilters } from './components/InsightsFilters';

export default function InsightsDashboard() {
  const t = useTranslations('insights');
  const [accountType, setAccountType] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    fetch('/api/accounttype')
      .then((res) => res.json())
      .then((data) => {
        setAccountType(data.accountType);
        setCheckingAuth(false);
      })
      .catch(() => {
        setAccountType('free');
        setCheckingAuth(false);
      });
  }, []);

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

  useEffect(() => {
    if (response?.meta?.limitReached && response.meta.nextUpdateAt) {
      toast.info(t('dailyLimitReached'), {
        description: t('nextUpdateAt', {
          date: new Date(response.meta.nextUpdateAt).toLocaleString(),
        }),
      });
    }
  }, [response, t]);

  if (checkingAuth) {
    return <LoadingState message={t('loadingInsights')} />;
  }

  if (accountType !== 'pro') {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl p-12 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10" />
        <div className="relative flex flex-col items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 ring-1 ring-white/10">
            <Lock size={40} className="text-purple-400" />
          </div>
          <div className="space-y-2 max-w-md">
            <h2 className="text-2xl font-bold text-white">Pro Plan Required</h2>
            <p className="text-gray-400">
              Unlock AI-powered insights, advanced analytics patterns, and automated suggestions with the Pro plan.
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-purple-500/40"
          >
            <Sparkles size={18} />
            Upgrade to Pro
          </button>
        </div>
      </div>
    );
  }

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

