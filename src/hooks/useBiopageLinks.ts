// src/hooks/useBiopageLinks.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { LinkType, SelectedLink } from '@/types/globals';

export function useBiopageLinks(user: { id: string; name: string, email: string } | undefined) {
    const [links, setLinks] = useState<LinkType[]>([]);
    const hasFetchedRef = useRef(false);

    const fetchLinks = useCallback(async () => {
        if (!user || hasFetchedRef.current) return;

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

    const toggleSelect = useCallback((
        link: LinkType,
        selected: SelectedLink[],
        setSelected: (value: SelectedLink[] | ((prev: SelectedLink[]) => SelectedLink[])) => void
    ) => {
        const slug = link.slug ?? link.shortId;
        if (!slug) return;

        setSelected((prev) =>
            prev.some((l) => l.shortId === slug)
                ? prev.filter((l) => l.shortId !== slug)
                : [...prev, { shortId: slug, slug, shortUrl: link.shortUrl, label: '' }]
        );
    }, []);

    const updateLabel = useCallback((
        shortUrl: string,
        value: string,
        setSelected: (value: SelectedLink[] | ((prev: SelectedLink[]) => SelectedLink[])) => void
    ) => {
        setSelected((prev) =>
            prev.map((link) =>
                link.shortUrl === shortUrl ? { ...link, label: value } : link
            )
        );
    }, []);

    return {
        links,
        toggleSelect,
        updateLabel,
    };
}