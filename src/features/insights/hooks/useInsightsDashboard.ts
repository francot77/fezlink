import { useState, useMemo, useEffect } from 'react';
import { useInsights } from '@/hooks/useInsights';
import { mapInsight } from '../utils/insightMapper';

export type InsightCategory =
  | 'all'
  | 'traffic'
  | 'geography'
  | 'performance'
  | 'temporal'
  | 'device'
  | 'source';

export function useInsightsDashboard() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'yearly'>('30d');
  const { response, loading, error, refetch } = useInsights(period);
  const [selectedInsight, setSelectedInsight] = useState<any | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<InsightCategory>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh logic
  useEffect(() => {
    if (response?.status === 'pending' || response?.status === 'calculating') {
      const timer = setTimeout(() => {
        refetch();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [response?.status, refetch]);

  const insights = useMemo(() => {
    if (!response || response.status !== 'completed') return [];
    return response.data.insights.map(mapInsight);
  }, [response]);

  const filteredInsights = useMemo(() => {
    if (categoryFilter === 'all') return insights;
    return insights.filter((i: any) => i.category === categoryFilter);
  }, [insights, categoryFilter]);

  const stats = useMemo(() => {
    if (!response || response.status !== 'completed') return null;

    const byType = insights.reduce((acc: any, i: any) => {
      acc[i.type] = (acc[i.type] || 0) + 1;
      return acc;
    }, {});

    const byCategory = insights.reduce((acc: any, i: any) => {
      acc[i.category] = (acc[i.category] || 0) + 1;
      return acc;
    }, {});

    return {
      total: insights.length,
      byType,
      byCategory,
      totalClicks: response.data.totalClicks,
      totalLinks: response.data.totalLinks,
    };
  }, [insights, response]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return {
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
  };
}
