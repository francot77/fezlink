// src/hooks/useBiopageLinks.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { LinkType, SelectedLink } from '@/types/globals';

export function useBiopageLinks(user: { id: string; name: string; email: string } | undefined) {
  const [links, setLinks] = useState<LinkType[]>([]);
  const hasFetchedRef = useRef(false);

  const fetchLinks = useCallback(async () => {
    if (!user || hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    try {
      const res = await fetch('/api/links');
      const data = await res.json();
      if (res.ok) {
        setLinks(data.links || []);
        hasFetchedRef.current = true;
      }
    } catch (error) {
      console.error('Error fetching links:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const toggleSelect = useCallback(
    (
      link: LinkType,
      selected: SelectedLink[],
      setSelected: (value: SelectedLink[] | ((prev: SelectedLink[]) => SelectedLink[])) => void
    ) => {
      // 1. Check if it is selected using the same logic as the UI (shortUrl)
      const isCurrentlySelected = selected.some((l) => l.shortUrl === link.shortUrl);

      if (isCurrentlySelected) {
        // Remove
        setSelected((prev) => prev.filter((l) => l.shortUrl !== link.shortUrl));
      } else {
        // Add - AND cleanup any stale versions
        setSelected((prev) => {
          // Remove any entry that matches the identity of this link (by code or slug)
          // to prevent duplicates if the slug/url changed.
          const cleaned = prev.filter(
            (l) =>
              l.shortUrl !== link.shortUrl && // Should be implied, but safe
              l.shortId !== link.shortId && // Match by code
              (link.slug ? l.shortId !== link.slug : true) // Match by slug (if stored in shortId)
          );

          const displayId = link.slug ?? link.shortId;

          if (!displayId) return cleaned; // Should not happen

          return [
            ...cleaned,
            {
              shortId: displayId,
              slug: link.slug,
              shortUrl: link.shortUrl,
              label: '',
            },
          ];
        });
      }
    },
    []
  );

  const updateLabel = useCallback(
    (
      shortUrl: string,
      value: string,
      setSelected: (value: SelectedLink[] | ((prev: SelectedLink[]) => SelectedLink[])) => void
    ) => {
      setSelected((prev) =>
        prev.map((link) => (link.shortUrl === shortUrl ? { ...link, label: value } : link))
      );
    },
    []
  );

  return {
    links,
    toggleSelect,
    updateLabel,
  };
}
