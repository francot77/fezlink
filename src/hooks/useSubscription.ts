import { useAuth } from './useAuth';
import useSWR from 'swr';

export type AccountType = 'free' | 'starter' | 'pro';

interface SubscriptionState {
  accountType: AccountType;
  isPremium: boolean;
  expiresAt?: number;
  isLoading: boolean;
  error: Error | null;
  mutate: () => Promise<any>;
}

const fetcher = (url: string) => fetch(url, {
  headers: { 'Cache-Control': 'no-cache' }
}).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch subscription');
  return res.json();
});

export function useSubscription(): SubscriptionState {
  const { user } = useAuth();

  const { data, error, isLoading, mutate } = useSWR(
    user ? '/api/accounttype' : null,
    fetcher,
    {
      revalidateOnFocus: false, // Subscription doesn't change often
      dedupingInterval: 60000, // 1 minute
    }
  );

  if (!user) {
    return {
      accountType: 'free',
      isPremium: false,
      isLoading: false,
      error: null,
      mutate: async () => { },
    };
  }

  return {
    accountType: data?.accountType || 'free',
    isPremium: data?.isPremium || false,
    expiresAt: data?.expiresAt,
    isLoading,
    error: error || null,
    mutate,
  };
}
