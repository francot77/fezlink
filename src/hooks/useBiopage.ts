// src/hooks/useBiopage.ts
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { BiopageType, SelectedLink } from '@/types/globals';
import { Link } from '@/hooks/useLinks';
import useSWR from 'swr';
import { useSubscription } from './useSubscription';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
});

export function useBiopage(translations: Record<string, string>) {
  const { data: session } = useSession();
  const user = session?.user;

  // Reuse subscription hook for isPremium (deduplicated by SWR)
  const { isPremium, accountType } = useSubscription();

  const { data: biopageData, isLoading: biopageLoading, mutate } = useSWR(
    user ? '/api/biopage' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const [biopage, setBiopage] = useState<BiopageType | null>(null);

  // Local editor state
  const [selected, setSelected] = useState<SelectedLink[]>([]);
  const [bgColor, setBgColor] = useState('#000000');
  const [textColor, setTextColor] = useState('#ffffff');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [description, setDescription] = useState('');

  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | undefined>();
  const [backgroundBlur, setBackgroundBlur] = useState<number>(16);
  const [backgroundZoom, setBackgroundZoom] = useState<number>(1);
  const [backgroundPositionX, setBackgroundPositionX] = useState<number>(0);
  const [backgroundPositionY, setBackgroundPositionY] = useState<number>(0);

  // Sync SWR data to local state
  useEffect(() => {
    if (biopageData?.biopage) {
      const bp = biopageData.biopage;
      setBiopage(bp);

      // Only sync if we haven't modified locally? 
      // For now, let's sync on load. Since this is an editor, we might want to be careful.
      // But usually SWR runs on mount.

      // Check if we are already initialized to avoid overwriting user edits if SWR revalidates?
      // For simplicity, we trust SWR data is the source of truth on mount.
      // To avoid overwriting while editing, we disabled revalidateOnFocus.

      setSelected(bp.links || []);
      setBgColor(bp.background.base || '#000000');
      setTextColor(bp.textColor || '#ffffff');
      setAvatarUrl(bp.avatarUrl || '');
      setDescription(bp.description || '');

      if (bp.background?.image) {
        setBackgroundBlur(bp.background.image.blur);
        setBackgroundPositionX(bp.background.image.positionX);
        setBackgroundPositionY(bp.background.image.positionY);
        setBackgroundImageUrl(bp.background.image.url);
        setBackgroundZoom(bp.background.image.zoom ?? 1);
      }
    } else if (biopageData === null) {
      setBiopage(null);
    }
  }, [biopageData]);

  const handleBackgroundImageChange = (url: string) => {
    setBackgroundImageUrl(url);

    // opcional pero recomendable: mantener biopage coherente
    setBiopage((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        background: {
          ...prev.background,
          image: {
            url,
            blur: backgroundBlur,
            positionX: backgroundPositionX,
            positionY: backgroundPositionY,
            zoom: backgroundZoom,
          },
        },
      };
    });
  };

  const createBiopage = useCallback(async () => {
    try {
      const res = await fetch('/api/biopage/create', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        // Mutate SWR cache
        mutate({ biopage: data.biopage }, false);
        toast.success(translations.created, { richColors: true, position: 'top-center' });
      } else {
        toast.error(translations.createError, { richColors: true, position: 'top-center' });
      }
    } catch {
      toast.error(translations.createError, { richColors: true, position: 'top-center' });
    }
  }, [translations, mutate]);

  const saveBiopage = useCallback(async (availableLinks?: Link[]) => {
    if (!biopage) {
      toast.error(translations.updateError, { richColors: true, position: 'top-center' });
      return;
    }

    let linksToSave = selected;

    // 🔹 FILTERING: If availableLinks provided, clean up any "ghost" links that no longer exist for the user
    if (availableLinks) {
      const availableMap = new Set(availableLinks.map((l) => l.shortUrl));
      const cleanList = selected.filter((l) => availableMap.has(l.shortUrl));

      if (cleanList.length !== selected.length) {
        console.log(`[useBiopage] Cleaning up ghost links. Before: ${selected.length}, After: ${cleanList.length}`);
        linksToSave = cleanList;
        setSelected(cleanList); // Update local state too
      }
    }

    try {
      const res = await fetch('/api/biopage/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          links: linksToSave,
          backgroundColor: bgColor,
          backgroundImage: backgroundImageUrl,
          backgroundBlur,
          backgroundZoom,
          textColor,
          avatarUrl: avatarUrl || '',
          description,
          backgroundPosition: { x: backgroundPositionX, y: backgroundPositionY },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Update SWR cache
        mutate({ biopage: data.biopage }, false);
        toast.success(translations.saved, { richColors: true, position: 'top-center' });
      } else {
        const errorMessage = typeof data.error === 'object'
          ? Object.values(data.error).map((e: any) => e.errors?.join(', ')).join('; ')
          : data.error;
        toast.error(`${translations.slugErrorPrefix} ${errorMessage || translations.saveError}`, {
          richColors: true,
          position: 'top-center',
        });
      }
    } catch (error) {
      toast.error(`${translations.saveError}: ${error}`, {
        richColors: true,
        position: 'top-center',
      });
    }
  }, [
    biopage,
    selected,
    bgColor,
    textColor,
    backgroundPositionX,
    backgroundPositionY,
    backgroundBlur,
    backgroundZoom,
    backgroundImageUrl,
    avatarUrl,
    description,
    translations,
    mutate
  ]);

  const changeSlug = useCallback(
    async (newSlug: string) => {
      try {
        const res = await fetch('/api/biopage/changeslug', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: newSlug }),
        });

        const data = await res.json();
        if (res.ok) {
          // Update SWR cache
          mutate((currentData: any) => {
            if (!currentData?.biopage) return currentData;
            return {
              ...currentData,
              biopage: { ...currentData.biopage, slug: newSlug }
            };
          }, false);

          toast.success(translations.slugSaved, { richColors: true, position: 'top-center' });
          return true;
        } else {
          const errorMessage = typeof data.error === 'object'
            ? Object.values(data.error).map((e: any) => e.errors?.join(', ')).join('; ')
            : data.error;
          toast.error(`${translations.slugErrorPrefix} ${errorMessage || translations.saveError}`, {
            richColors: true,
            position: 'top-center',
          });
          return false;
        }
      } catch (error) {
        toast.error(`${translations.saveError}: ${error}`, {
          richColors: true,
          position: 'top-center',
        });
        return false;
      }
    },
    [translations, mutate]
  );

  return {
    user,
    biopage,
    loading: biopageLoading,
    isPremium,
    accountType,
    selected,
    bgColor,
    textColor,
    avatarUrl,
    description,
    backgroundImageUrl,
    backgroundBlur,
    backgroundZoom,
    backgroundPositionX,
    backgroundPositionY,
    setSelected,
    setBgColor,
    setTextColor,
    setAvatarUrl,
    setDescription,
    setBackgroundPositionX,
    setBackgroundPositionY,
    setBackgroundImageUrl,
    setBackgroundBlur,
    setBackgroundZoom,
    handleBackgroundImageChange,
    setBiopage,
    createBiopage,
    saveBiopage,
    changeSlug,
  };
}
