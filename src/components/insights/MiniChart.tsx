// components/insights/MiniChart.tsx
interface MiniChartProps {
    data: number[];
    color?: string;
    height?: number;
}

export function MiniChart({ data, color = 'text-emerald-400', height = 120 }: MiniChartProps) {
    if (!data || data.length === 0) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    // Normalizar datos a porcentaje
    const normalized = data.map((value) => ((value - min) / range) * 100);

    // Width por punto
    const pointWidth = 100 / (data.length - 1 || 1);

    // Generar path SVG
    const pathPoints = normalized.map((value, i) => {
        const x = i * pointWidth;
        const y = 100 - value; // Invertir Y
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    // Path para área rellena
    const areaPath = `
        ${pathPoints}
        L ${100} ${100}
        L ${0} ${100}
        Z
    `;

    // Extraer color hex
    const colorClass = color.replace('text-', '');
    const colorMap: Record<string, string> = {
        'emerald-400': '#34d399',
        'blue-400': '#60a5fa',
        'yellow-400': '#fbbf24',
        'red-400': '#f87171',
        'gray-400': '#9ca3af'
    };
    const strokeColor = colorMap[colorClass] || '#34d399';

    return (
        <div className="relative" style={{ height: `${height}px` }}>
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="overflow-visible"
            >
                {/* Área rellena con gradiente */}
                <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
                    </linearGradient>
                </defs>

                <path
                    d={areaPath}
                    fill="url(#chartGradient)"
                    className="transition-all duration-300"
                />

                {/* Línea principal */}
                <path
                    d={pathPoints}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                />

                {/* Puntos */}
                {normalized.map((value, i) => (
                    <circle
                        key={i}
                        cx={i * pointWidth}
                        cy={100 - value}
                        r="1.5"
                        fill={strokeColor}
                        className="opacity-60 hover:opacity-100 transition-opacity"
                    />
                ))}
            </svg>

            {/* Labels opcionales */}
            <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Inicio</span>
                <span className={color}>
                    Max: {max.toLocaleString()}
                </span>
                <span>Final</span>
            </div>
        </div>
    );
}