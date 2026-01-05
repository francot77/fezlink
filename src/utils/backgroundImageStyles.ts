// utils/backgroundImageStyles.ts

/**
 * Genera estilos consistentes para background image
 * Usar en TODOS los componentes que muestren la biopage
 */
export function getBackgroundImageStyles({
    imageUrl,
    blur = 0,
    zoom = 0,
    positionX = 0,
    positionY = 0,
}: {
    imageUrl?: string;
    blur?: number;
    zoom?: number;
    positionX?: number;
    positionY?: number;
}): React.CSSProperties {
    if (!imageUrl) return {};

    return {
        backgroundImage: `url(${imageUrl})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',

        // Position: 50% es el centro, sumamos el offset
        backgroundPosition: `${50 + positionX}% ${50 + positionY}%`,

        // Blur
        filter: `blur(${blur}px)`,

        // Zoom: 0 = 100% (scale 1), 100 = 200% (scale 2)
        transform: `scale(${1 + zoom / 100})`,
        transformOrigin: 'center',
    };
}

/**
 * Genera el color base (sólido o gradient)
 */
export function getBaseColorStyle(bgColor: string): React.CSSProperties {
    if (bgColor?.includes('gradient')) {
        return {
            backgroundImage: bgColor,
        };
    }
    return {
        backgroundColor: bgColor || '#000000',
    };
}