/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useId, useRef, useState } from 'react';

interface QRButtonProps {
    url: string;
    label?: string;
    textColor?: string;
    backgroundColor?: string;
}

export default function QRButton({
    url,
    label = 'Ver QR',
    textColor = '#ffffff',
    backgroundColor = '#000000'
}: QRButtonProps) {
    const [showQR, setShowQR] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const tooltipId = useId();

    useEffect(() => {
        if (!showQR) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (!popoverRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
                setShowQR(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowQR(false);
                triggerRef.current?.focus();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showQR]);

    // Fuerza el fondo del QR a ser blanco (#FFFFFF)
    const qrCodeUrl = `https://quickchart.io/qr?text= ${encodeURIComponent(url)}&size=200&background=FFFFFF`;

    return (
        <div className="relative inline-block">
            <button
                ref={triggerRef}
                onClick={() => setShowQR((prev) => !prev)}
                aria-haspopup="dialog"
                aria-expanded={showQR}
                aria-controls={showQR ? tooltipId : undefined}
                className="px-3 py-1 text-sm font-medium rounded transition-all duration-300 focus:outline-none shadow-md hover:shadow-lg"
                style={{ color: textColor, backgroundColor }}
            >
                {label}
            </button>

            {/* Tooltip con QR */}
            {showQR && (
                <div
                    ref={popoverRef}
                    id={tooltipId}
                    role="dialog"
                    aria-label="Código QR para compartir"
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 z-50 bg-white p-3 rounded-lg shadow-2xl animate-fade-in"
                    style={{ pointerEvents: 'auto' }}
                >
                    <img
                        src={qrCodeUrl}
                        alt="Código QR"
                        width={200}
                        height={200}
                        className="block bg-white rounded shadow-inner"
                    />
                    <p className="text-xs text-center mt-2 text-gray-600">Escanéame</p>
                </div>
            )}
        </div>
    );
}