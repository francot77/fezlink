"use client";

import { ReactNode, useEffect, useId, useRef } from "react";

interface CustomModalProps {
    title: string;
    children: ReactNode;
    onClose: () => void;
    onAccept: () => void;
    acceptText?: string;
}

const CustomModal = ({
    title,
    children,
    onClose,
    onAccept,
    acceptText = "Aceptar",
}: CustomModalProps) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const headingId = useId();

    useEffect(() => {
        const previouslyFocused = document.activeElement as HTMLElement | null;
        const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        focusableElements?.[0]?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
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
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4" role="presentation">
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={headingId}
                className="bg-gray-900 rounded-xl shadow-2xl shadow-black/30 overflow-hidden w-full max-w-md mx-auto"
                tabIndex={-1}
            >
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 id={headingId} className="text-lg font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Cerrar">
                        ×
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
                <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md transition">
                        Cancelar
                    </button>
                    <button
                        onClick={onAccept}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition"
                    >
                        {acceptText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomModal;
