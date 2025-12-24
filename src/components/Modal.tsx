"use client";

import React, { ReactNode, useEffect, useId, useRef } from 'react';

export interface ModalProps {
    isOpen: boolean;
    title?: string;
    isLoading?: boolean;
    description?: ReactNode;
    onAccept?: () => void;
    onCancel?: () => void;
    isStats?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, description, onAccept, onCancel }) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const headingId = useId();

    useEffect(() => {
        if (!isOpen) return;

        const previouslyFocused = document.activeElement as HTMLElement | null;
        const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        focusableElements?.[0]?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && onCancel) {
                event.preventDefault();
                onCancel();
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
            previouslyFocused?.focus();
        };
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 overflow-y-auto" role="presentation">
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? headingId : undefined}
                className="relative w-full max-w-5xl rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl shadow-blue-700/20"
                tabIndex={-1}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        {title && <h2 id={headingId} className="text-2xl font-semibold text-white">{title}</h2>}
                    </div>
                    {onCancel && (
                        <button
                            aria-label="Cerrar"
                            onClick={onCancel}
                            className="rounded-full border border-gray-700 bg-gray-800 p-2 text-gray-300 transition hover:border-gray-500 hover:text-white"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="mt-4 text-gray-200">{description}</div>

                {(onAccept) && (
                    <div className="mt-6 flex flex-wrap justify-end gap-3">

                        {onAccept && (
                            <button
                                onClick={onAccept}
                                className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
                            >
                                Cerrar
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
