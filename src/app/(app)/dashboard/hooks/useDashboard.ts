import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';

export function useDashboard(initialSection = 'links') {
    const [activeSection, setActiveSection] = useState<string>(initialSection);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [modalLogout, setModalLogout] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLElement>(null);

    const handleSectionChange = (sectionId: string) => {
        if (sectionId === activeSection) return;

        setIsTransitioning(true);
        setActiveSection(sectionId);
        setIsMobileSidebarOpen(false);

        // Scroll to main content on mobile
        if (window.innerWidth < 768 && mainRef.current) {
            setTimeout(() => {
                mainRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest',
                });
            }, 100);
        }

        // Reset transition state after animation
        setTimeout(() => {
            setIsTransitioning(false);
        }, 300);
    };

    const handleLogout = () => {
        setModalLogout(false);
        signOut();
    };

    // Close mobile sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (
                isMobileSidebarOpen &&
                !target.closest('.mobile-sidebar') &&
                !target.closest('.menu-button')
            ) {
                setIsMobileSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileSidebarOpen]);

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        if (isMobileSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileSidebarOpen]);

    return {
        activeSection,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        modalLogout,
        setModalLogout,
        isTransitioning,
        contentRef,
        mainRef,
        handleSectionChange,
        handleLogout,
    };
}
