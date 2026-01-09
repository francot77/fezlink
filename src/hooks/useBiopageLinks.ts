// src/hooks/useBiopageLinks.ts
import { useCallback } from 'react';
import { SelectedLink } from '@/types/globals';
import useLinks, { Link } from './useLinks';

export function useBiopageLinks(user: { id: string; name: string; email: string } | undefined) {
  // Reuse useLinks (SWR) to share cache
  const { links } = useLinks({ autoLoad: !!user });

  const toggleSelect = useCallback(
    (
      link: Link, // Use Link interface from useLinks
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
              // @ts-ignore: link might not have shortId, but checking just in case
              (link.shortId ? l.shortId !== link.shortId : true) && 
              (link.slug ? l.shortId !== link.slug : true) // Match by slug (if stored in shortId)
          );

          // Use slug as primary ID, fallback to shortId if it existed (legacy)
          // @ts-ignore: link.shortId
          const displayId = link.slug ?? link.shortId;

          if (!displayId) return cleaned; // Should not happen if slug is present

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
