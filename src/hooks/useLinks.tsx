'use client';
import { toast } from 'sonner';
import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';

/* ---------------- types ---------------- */

export interface Link {
  id: string;
  destinationUrl: string;
  shortUrl: string;
  slug: string;
  clicks: number;
  byCountry?: Record<string, number>; // 👈 viene directo del backend
}

/* ---------------- hook ---------------- */
function countryCodeToFlag(code: string) {
  if (code.length !== 2) return '🏳️';
  const base = 127397;
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split('')
      .map((c) => base + c.charCodeAt(0))
  );
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const useLinks = (options?: { autoLoad?: boolean }) => {
  const autoLoad = options?.autoLoad ?? true;

  const { data, error, isLoading, mutate } = useSWR(
    autoLoad ? '/api/links' : null,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  const links: Link[] = useMemo(() => data?.links || [], [data]);
  const loading = isLoading;

  const [newUrl, setNewUrl] = useState('https://');
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [modalType, setModalType] = useState<null | 'stats' | 'delete'>(null);
  const [deleteInput, setDeleteInput] = useState<string>('');

  /* ---------------- actions ---------------- */

  const addLink = useCallback(async (destinationUrl: string) => {
    toast.promise(
      async () => {
        const res = await fetch('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destinationUrl }),
        });
        const newLink = await res.json();
        if (newLink.error) throw new Error(newLink.error);
        
        // Mutate local cache
        mutate((currentData: any) => ({
            ...currentData,
            links: [...(currentData?.links || []), newLink]
        }), false);
        
        setNewUrl('https://');
      },
      {
        loading: 'Agregando link...',
        success: 'Link agregado correctamente',
        error: (err) => `Error: ${err.message}`,
        position: 'top-center',
        richColors: true,
      }
    );
  }, [mutate]);

  const openStats = useCallback((link: Link) => {
    setSelectedLink(link);
    setModalType('stats');
  }, []);

  const handleDelete = useCallback((link: Link) => {
    setSelectedLink(link);
    setModalType('delete');
  }, []);

  const deleteLink = useCallback(
    async (id: string, twoFactorCode?: string) => {
      if (deleteInput !== 'DELETE') {
        toast.info('Debes escribir DELETE para borrar el link', {
          richColors: true,
          position: 'top-center',
        });
        return;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (twoFactorCode) {
        headers['x-2fa-code'] = twoFactorCode;
      }

      const res = await fetch(`/api/links/${id}`, { 
        method: 'DELETE',
        headers
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === '2FA_REQUIRED') {
            throw new Error('2FA_REQUIRED');
        }
        if (data.error === 'INVALID_2FA') {
            throw new Error('INVALID_2FA');
        }
        throw new Error('Failed to delete link');
      }

      // Mutate local cache
      mutate((currentData: any) => ({
        ...currentData,
        links: (currentData?.links || []).filter((link: Link) => link.id !== id)
      }), false);

      closeModal();
    },
    [deleteInput, mutate] // Added mutate to dependencies
  );

  const closeModal = useCallback(() => {
    setModalType(null);
    setSelectedLink(null);
    setDeleteInput('');
  }, []);

  /* ---------------- derived stats ---------------- */

  const countries = useMemo(() => {
    if (!selectedLink?.byCountry) return [];

    return Object.entries(selectedLink.byCountry)
      .map(([country, clicksCount]) => ({
        country,
        clicksCount,
      }))
      .sort((a, b) => b.clicksCount - a.clicksCount);
  }, [selectedLink]);

  const hasCountries = countries.length > 0;
  const totalClicksByCountry = countries.reduce((acc, c) => acc + c.clicksCount, 0);

  /* ---------------- UI state derived ---------------- */

  return {
    links,
    loading,
    newUrl,
    setNewUrl,
    addLink,
    openStats,
    handleDelete,
    selectedLink,
    modalType,
    deleteInput,
    setDeleteInput,
    deleteLink,
    closeModal,
    countries,
    hasCountries,
    totalClicksByCountry,
  };
};

export default useLinks;
