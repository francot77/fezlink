import { formatMetricValue } from '@/features/metrics/utils/format';

describe('formatMetricValue', () => {
    it('formatea porcentajes con un decimal', () => {
        expect(formatMetricValue(12.345, 'percent')).toBe('12.3%');
    });

    it('formatea conteos con locale string', () => {
        expect(formatMetricValue(1234, 'count')).toBe((1234).toLocaleString());
    });

    it('usa sufijo k para valores grandes', () => {
        expect(formatMetricValue(1500)).toBe('1.5k');
    });

    it('redondea valores pequeños a entero', () => {
        expect(formatMetricValue(99.9)).toBe('100');
    });
});

