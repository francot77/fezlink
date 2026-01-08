import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export type AccountType = 'free' | 'starter' | 'pro';

interface SubscriptionState {
  accountType: AccountType;
  isPremium: boolean;
  expiresAt?: number;
  isLoading: boolean;
  error: Error | null;
  mutate: () => Promise<void>;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Omit<SubscriptionState, 'mutate'>>({
    accountType: 'free',
    isPremium: false,
    isLoading: true,
    error: null,
  });

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/accounttype', { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' } 
      });
      
      if (!res.ok) throw new Error('Failed to fetch subscription');
      
      const data = await res.json();
      
      setSubscription({
        accountType: data.accountType || 'free',
        isPremium: data.isPremium || false,
        expiresAt: data.expiresAt,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setSubscription(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: err instanceof Error ? err : new Error('Unknown error') 
      }));
    }
  };

  useEffect(() => {
    // Si no hay usuario logueado, asumimos free inmediatamente
    if (!user) {
      setSubscription(prev => ({ ...prev, isLoading: false, accountType: 'free' }));
      return;
    }

    fetchSubscription();
  }, [user]);

  return { ...subscription, mutate: fetchSubscription };
}
