/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useInsights.ts
import { useState, useEffect, useCallback } from 'react';
import type { InsightPeriod } from '@/types/insights.types';

interface InsightsResponse {
    status: 'pending' | 'calculating' | 'completed' | 'error';
    data?: any;
    error?: string;
    message?: string;
    estimatedWaitTime?: number;
}

export function useInsights(period: InsightPeriod) {
    const [response, setResponse] = useState<InsightsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInsights = useCallback(async (forceRefresh = false) => {
        try {
            setLoading(true);
            setError(null);

            const url = `/api/insights?period=${period}${forceRefresh ? '&forceRefresh=true' : ''}`;
            const res = await fetch(url);

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data: InsightsResponse = await res.json();
            setResponse(data);

        } catch (err: any) {
            console.error('Error fetching insights:', err);
            setError(err.message || 'Error desconocido');
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchInsights();
    }, [fetchInsights]);

    const refetch = useCallback((forceRefresh = false) => {
        return fetchInsights(forceRefresh);
    }, [fetchInsights]);

    return {
        response,
        loading,
        error,
        refetch
    };
}