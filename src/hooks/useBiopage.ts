// src/hooks/useBiopage.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { BiopageType, SelectedLink } from '@/types/globals';

export function useBiopage(translations: Record<string, string>) {
  const { data: session } = useSession();
  const user = session?.user;

  const [biopage, setBiopage] = useState<BiopageType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  const [selected, setSelected] = useState<SelectedLink[]>([]);
  const [bgColor, setBgColor] = useState('#000000');
  const [textColor, setTextColor] = useState('#ffffff');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [description, setDescription] = useState('');

  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | undefined>(
    biopage?.background?.image?.url
  );

  const [backgroundBlur, setBackgroundBlur] = useState<number>(
    biopage?.background?.image?.blur ?? 16
  );
  const [backgroundZoom, setBackgroundZoom] = useState<number>(0);
  const [backgroundPositionX, setBackgroundPositionX] = useState<number>(0);
  const [backgroundPositionY, setBackgroundPositionY] = useState<number>(0);

  // ✅ FIX: Usar ref para evitar re-renders innecesarios
  const hasFetchedRef = useRef(false);

  const fetchBiopage = useCallback(async () => {
    if (!user || hasFetchedRef.current) return;

    setLoading(true);

    try {
      // Fetch account type
      const resAT = await fetch('/api/accounttype');
      if (resAT.ok) {
        const data = await resAT.json();
        setIsPremium(data.isPremium || false);
      }

      // Fetch biopage
      const res = await fetch('/api/biopage');
      if (res.ok) {
        const data = await res.json();
        if (data.biopage) {
          setBiopage((prev) => {
            if (!prev) return data.biopage;

            return {
              ...prev,
              ...data.biopage,
              background: {
                ...prev.background,
                ...data.biopage.background,
                image: {
                  ...prev.background?.image,
                  ...data.biopage.background?.image,
                },
              },
            };
          });
          setSelected(data.biopage.links || []);
          setBgColor(data.biopage.background.base || '#000000');
          setTextColor(data.biopage.textColor || '#ffffff');
          setAvatarUrl(data.biopage.avatarUrl || '');
          setDescription(data.biopage.description || '');
          setBackgroundBlur(data.biopage.background.image.blur);
          setBackgroundPositionX(data.biopage.background.image.positionX);
          setBackgroundPositionY(data.biopage.background.image.positionY);
          setBackgroundImageUrl(data.biopage.background.image.url);
        } else {
          setBiopage(null);
        }
      } else if (res.status === 404) {
        setBiopage(null);
      }

      hasFetchedRef.current = true;
    } catch (error) {
      console.error('Error fetching biopage:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBiopage();
  }, [fetchBiopage]);

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
            backgroundZoom,
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
        setBiopage(data.biopage);
        setSelected(data.biopage.links || []);
        setBgColor(data.biopage.backgroundColor || '#000000');
        setTextColor(data.biopage.textColor || '#ffffff');
        setAvatarUrl(data.biopage.avatarUrl || '');
        setDescription(data.biopage.description || '');
        toast.success(translations.created, { richColors: true, position: 'top-center' });
      } else {
        toast.error(translations.createError, { richColors: true, position: 'top-center' });
      }
    } catch {
      toast.error(translations.createError, { richColors: true, position: 'top-center' });
    }
  }, [translations]);

  const saveBiopage = useCallback(async () => {
    if (!biopage) {
      toast.error(translations.updateError, { richColors: true, position: 'top-center' });
      return;
    }

    try {
      const res = await fetch('/api/biopage/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          links: selected,
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
        setBiopage((prev) => {
          if (!prev) return data.biopage;

          return {
            ...prev,
            ...data.biopage,
            background: {
              ...prev.background,
              ...data.biopage.background,
              image: data.biopage.background?.image ?? prev.background?.image,
            },
          };
        });
        setAvatarUrl(data.biopage.avatarUrl || avatarUrl);
        setDescription(data.biopage.description || description);
        toast.success(translations.saved, { richColors: true, position: 'top-center' });
      } else {
        toast.error(`${translations.slugErrorPrefix} ${data.error || translations.saveError}`, {
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
          setBiopage((prev) => (prev ? { ...prev, slug: newSlug } : prev));
          toast.success(translations.slugSaved, { richColors: true, position: 'top-center' });
          return true;
        } else {
          toast.error(`${translations.slugErrorPrefix} ${data.error || translations.saveError}`, {
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
    [translations]
  );

  return {
    user,
    biopage,
    loading,
    isPremium,
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
