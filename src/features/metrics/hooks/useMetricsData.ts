import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { fetchLinkAnalytics } from '@/core/analytics/client';
import { MetricsData } from '../types/metrics';

interface UseMetricsDataProps {
  linkId: string;
  startDate: string;
  endDate: string;
  country: string;
  deviceType: string;
  source: string;
  language: string;
}


export const useMetricsData = ({
  linkId,
  startDate,
  endDate,
  country,
  deviceType,
  source,
  language,
}: UseMetricsDataProps) => {
  const locale = useLocale();
  const [data, setData] = useState<MetricsData>({
    stats: [],
    totalClicks: 0,
    availableCountries: [],
    availableSources: [],
    availableDevices: [],
    countryTotals: {},
    deviceTotals: [],
    sourceTotals: [],
    deviceTrends: [],
    sourceTrends: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatForDisplay = useCallback(
    (dateStr: string, isMonthly: boolean) => {
      const parts = dateStr.split('-').map((v) => parseInt(v, 10));
      if (isMonthly) {
        const d = new Date(parts[0], (parts[1] || 1) - 1, 1);
        const monthFull = d.toLocaleString(locale, { month: 'long' });
        return `${monthFull} ${d.getFullYear()}`;
      }
      const d = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
      return d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: '2-digit' });
    },
    [locale]
  );

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const apiData = await fetchLinkAnalytics({
        linkId,
        startDate,
        endDate,
        country,
        deviceType,
        source,
      });
      const isMonthly = apiData.metadata?.frequency === 'monthly';

      setData({
        stats: apiData.daily.map((d: { date: string; clicks: number }) => ({
          _id: d.date,
          clicks: d.clicks,
          displayDate: formatForDisplay(d.date, isMonthly),
          isMonthly,
        })),
        totalClicks: apiData.totalClicks ?? 0,
        countryTotals: apiData.byCountry || {},
        availableCountries: Object.keys(apiData.byCountry || {}),
        deviceTotals: Object.entries(apiData.byDevice || {}).map(([deviceType, clicks]) => ({
          deviceType,
          clicks: Number(clicks),
        })),
        availableDevices: Object.keys(apiData.byDevice || {}),
        sourceTotals: Object.entries(apiData.bySource || {}).map(([source, clicks]) => ({
          source,
          clicks: Number(clicks),
        })),
        availableSources: Object.keys(apiData.bySource || {}),
        deviceTrends: apiData.trends?.byDevice ?? [],
        sourceTrends: apiData.trends?.bySource ?? [],
      });
    } catch (err) {
      setError(language === 'es' ? 'Error al cargar analíticas' : 'Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [linkId, startDate, endDate, country, deviceType, source, formatForDisplay]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, loading, error, refetch: fetchAnalytics };
};
