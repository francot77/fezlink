import { getBackgroundImageStyles, getBaseColorStyle } from '@/utils/backgroundImageStyles';

describe('backgroundImageStyles', () => {
    test('returns empty when no imageUrl', () => {
        const styles = getBackgroundImageStyles({ imageUrl: undefined });
        expect(styles).toEqual({});
    });

    test('generates styles with defaults', () => {
        const styles = getBackgroundImageStyles({ imageUrl: 'http://example.com/img.png' });
        expect(styles.backgroundImage).toBe('url(http://example.com/img.png)');
        expect(styles.backgroundRepeat).toBe('no-repeat');
        expect(styles.backgroundSize).toBe('cover');
        expect(styles.backgroundPosition).toBe('50% 50%');
        expect(styles.filter).toBe('blur(0px)');
        expect(styles.transform).toBe('scale(1)');
        expect(styles.transformOrigin).toBe('center');
    });

    test('applies blur and zoom', () => {
        const styles = getBackgroundImageStyles({ imageUrl: 'x', blur: 4, zoom: 25 });
        expect(styles.filter).toBe('blur(4px)');
        expect(styles.transform).toBe('scale(1.25)');
    });

    test('applies position offsets', () => {
        const styles = getBackgroundImageStyles({ imageUrl: 'x', positionX: 10, positionY: -5 });
        expect(styles.backgroundPosition).toBe('60% 45%');
    });
});

describe('getBaseColorStyle', () => {
    test('solid color', () => {
        const styles = getBaseColorStyle('#ffffff');
        expect(styles.backgroundColor).toBe('#ffffff');
        expect(styles).not.toHaveProperty('backgroundImage');
    });

    test('gradient string', () => {
        const gradient = 'linear-gradient(90deg, #000, #fff)';
        const styles = getBaseColorStyle(gradient);
        expect(styles.backgroundImage).toBe(gradient);
        expect(styles).not.toHaveProperty('backgroundColor');
    });
});

