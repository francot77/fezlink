/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useInsights.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import type { InsightPeriod } from '@/types/insights.types';

interface InsightsResponse {
  status: 'pending' | 'calculating' | 'completed' | 'error';
  data?: any;
  error?: string;
  message?: string;
  estimatedWaitTime?: number;
  meta?: {
    limitReached?: boolean;
    nextUpdateAt?: string;
  };
}

// Global cache to persist data across component remounts/period changes
// Key: period (e.g., "30d"), Value: { data: InsightsResponse, timestamp: number }
const insightsCache = new Map<string, { data: InsightsResponse; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useInsights(period: InsightPeriod) {
  const [response, setResponse] = useState<InsightsResponse | null>(() => {
    // Initial state from cache if available
    const cached = insightsCache.get(period);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return cached.data;
    }
    return null;
  });
  
  const [loading, setLoading] = useState(!response); // Don't load if we have cache
  const [error, setError] = useState<string | null>(null);
  
  // Ref to track fetch status per period to avoid strict mode double fetch
  const hasFetchedRef = useRef<string | null>(null);

  const fetchInsights = useCallback(
    async (forceRefresh = false) => {
      // Create a unique key for this request
      const requestKey = `${period}-${forceRefresh}`;

      // Check cache again inside function (for updates without remount)
      if (!forceRefresh) {
         const cached = insightsCache.get(period);
         if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            setResponse(cached.data);
            setLoading(false);
            return;
         }
      }
      
      // If we already fetched for this period/state combination, skip
      if (hasFetchedRef.current === requestKey) return;
      
      hasFetchedRef.current = requestKey;

      try {
        setLoading(true);
        setError(null);

        const url = `/api/insights?period=${period}${forceRefresh ? '&forceRefresh=true' : ''}`;
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data: InsightsResponse = await res.json();
        
        // Save to cache if successful
        if (data.status === 'completed' || data.status === 'calculating') {
            insightsCache.set(period, { data, timestamp: Date.now() });
        }
        
        setResponse(data);
      } catch (err: any) {
        console.error('Error fetching insights:', err);
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [period]
  );

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const refetch = useCallback(
    (forceRefresh = false) => {
      return fetchInsights(forceRefresh);
    },
    [fetchInsights]
  );

  return {
    response,
    loading,
    error,
    refetch,
  };
}
