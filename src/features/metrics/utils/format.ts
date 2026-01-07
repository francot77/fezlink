export function formatMetricValue(value: number, unit?: string): string {
    if (unit === 'percent') return `${value.toFixed(1)}%`;
    if (unit === 'count') return value.toLocaleString();
    if (value > 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toFixed(0);
}

