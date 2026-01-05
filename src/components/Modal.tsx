"use client";

import React, { ReactNode, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface ModalProps {
    isOpen: boolean;
    title?: string;
    isLoading?: boolean;
    description?: ReactNode;
    onAccept?: () => void;
    onCancel?: () => void;
    isStats?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    title,
    description,
    onAccept,
    onCancel,
    isLoading = false
}) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const headingId = useId();
    const [isVisible, setIsVisible] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Ensure we're mounted on client
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setIsVisible(false);
            return;
        }

        // Trigger animation after mount
        requestAnimationFrame(() => {
            setIsVisible(true);
        });

        // Prevent body scroll when modal is open
        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;

        // Calculate scrollbar width to prevent layout shift
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        document.body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        const previouslyFocused = document.activeElement as HTMLElement | null;
        const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );

        setTimeout(() => {
            focusableElements?.[0]?.focus();
        }, 100);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && onCancel) {
                event.preventDefault();
                handleClose();
            }
            if (event.key === 'Tab' && focusableElements && focusableElements.length > 0) {
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                if (event.shiftKey && document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                } else if (!event.shiftKey && document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPaddingRight;
            previouslyFocused?.focus();
        };
    }, [isOpen, onCancel]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onCancel?.();
        }, 200);
    };

    if (!isOpen || !mounted) return null;

    // Render modal in a portal directly to body
    return createPortal(
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'bg-black/70 backdrop-blur-sm' : 'bg-black/0'
                }`}
            role="presentation"
            onClick={handleClose}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? headingId : undefined}
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-6xl max-h-[90vh] flex flex-col transform transition-all duration-300 ${isVisible
                        ? 'scale-100 opacity-100 translate-y-0'
                        : 'scale-95 opacity-0 translate-y-4'
                    }`}
                tabIndex={-1}
            >
                {/* Modal Card */}
                <div className="relative flex flex-col max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-xl shadow-2xl">
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />

                    {/* Header - Fixed, no scroll */}
                    <div className="relative shrink-0 border-b border-white/10 px-4 sm:px-6 py-4">
                        <div className="flex items-start justify-between gap-4">
                            {/* Title */}
                            {title && (
                                <div className="flex-1 min-w-0">
                                    <h2 id={headingId} className="text-xl sm:text-2xl font-bold text-white truncate">
                                        {title}
                                    </h2>
                                </div>
                            )}

                            {/* Close button */}
                            {onCancel && (
                                <button
                                    onClick={handleClose}
                                    disabled={isLoading}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Cerrar"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content - Scrollable area */}
                    <div className="relative flex-1 overflow-y-auto overflow-x-hidden">
                        <div className="px-4 sm:px-6 py-4 sm:py-6">
                            {description}
                        </div>
                    </div>

                    {/* Footer - Fixed, no scroll (only if onAccept exists) */}
                    {onAccept && (
                        <div className="relative shrink-0 border-t border-white/10 px-4 sm:px-6 py-4">
                            <div className="flex justify-end">
                                <button
                                    onClick={onAccept}
                                    disabled={isLoading}
                                    className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            <span>Cargando...</span>
                                        </>
                                    ) : (
                                        'Cerrar'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;