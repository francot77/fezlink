import { useState, useEffect, useCallback } from 'react';
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

const monthNames = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
};

export const useMetricsData = ({
    linkId,
    startDate,
    endDate,
    country,
    deviceType,
    source,
    language
}: UseMetricsDataProps) => {
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
        sourceTrends: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatForDisplay = useCallback((dateStr: string, isMonthly: boolean) => {
        const names = monthNames[language as keyof typeof monthNames];
        if (isMonthly) {
            const [year, month] = dateStr.split('-');
            return `${names[parseInt(month) - 1]} ${year}`;
        }
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year.slice(-2)}`;
    }, [language]);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const url = new URL(`/api/analytics/link/${linkId}`, window.location.origin);
            url.searchParams.append('from', startDate);
            url.searchParams.append('to', endDate);
            if (country) url.searchParams.append('country', country);
            if (deviceType) url.searchParams.append('device', deviceType);
            if (source) url.searchParams.append('source', source);

            const res = await fetch(url.toString());
            if (!res.ok) throw new Error('Failed to fetch analytics');

            const apiData = await res.json();
            const isMonthly = apiData.metadata?.frequency === 'monthly';

            setData({
                stats: apiData.daily.map((d: { date: string; clicks: number }) => ({
                    _id: d.date,
                    clicks: d.clicks,
                    displayDate: formatForDisplay(d.date, isMonthly),
                    isMonthly
                })),
                totalClicks: apiData.totalClicks ?? 0,
                countryTotals: apiData.byCountry || {},
                availableCountries: Object.keys(apiData.byCountry || {}),
                deviceTotals: Object.entries(apiData.byDevice || {}).map(([deviceType, clicks]) => ({
                    deviceType,
                    clicks: Number(clicks)
                })),
                availableDevices: Object.keys(apiData.byDevice || {}),
                sourceTotals: Object.entries(apiData.bySource || {}).map(([source, clicks]) => ({
                    source,
                    clicks: Number(clicks)
                })),
                availableSources: Object.keys(apiData.bySource || {}),
                deviceTrends: apiData.trends?.byDevice ?? [],
                sourceTrends: apiData.trends?.bySource ?? []
            });
        } catch (err) {
            setError('Failed to load analytics');
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