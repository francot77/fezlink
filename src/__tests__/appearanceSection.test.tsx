import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { AppearanceSection } from '@/features/biopage/AppearanceSection';
import { BIOPAGE_TRANSLATIONS } from '@/lib/biopage-constants';

jest.mock('lucide-react', () => {
  return {
    Palette: () => <span />,
    Check: () => <span />,
    Save: () => <span />,
    Image: () => <span />,
    Droplet: () => <span />,
    Sparkles: () => <span />,
    X: () => <span />,
    Upload: () => <span />,
  };
});

jest.mock('@/features/biopage/SectionCard', () => ({
  SectionCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));



describe('AppearanceSection accessibility and functionality', () => {
  const t = BIOPAGE_TRANSLATIONS.es;
  const gradients = [
    { label: 'Aurora', value: 'linear-gradient(135deg, #a855f7 0%, #22d3ee 50%, #0ea5e9 100%)' },
  ];

  function renderMarkup(overrides?: Partial<React.ComponentProps<typeof AppearanceSection>>) {
    const props: React.ComponentProps<typeof AppearanceSection> = {
      bgColor: '#000000',
      textColor: '#ffffff',
      slug: 'demo',
      gradients,
      backgroundImageUrl: undefined,
      backgroundBlur: 16,
      backgroundZoom: 0,
      isPremium: true,
      positionX: 0,
      positionY: 0,
      onBgColorChange: () => { },
      onTextColorChange: () => { },
      onBackgroundImageChange: () => { },
      onBackgroundBlurChange: () => { },
      onBackgroundZoomChange: () => { },
      onBackgroundPositionX: () => { },
      onBackgroundPositionY: () => { },
      onSave: () => { },
      translations: t,
      ...(overrides || {}),
    };
    const html = ReactDOMServer.renderToString(<AppearanceSection {...props} />);
    return html;
  }

  test('does not display hex text inputs', () => {
    const html = renderMarkup();
    expect(html.includes('type="text"')).toBe(false);
  });

  test('has accessible color inputs with aria-labels', () => {
    const html = renderMarkup();
    const colorInputs = (html.match(/type="color"/g) || []).length;
    expect(colorInputs).toBe(2);
    expect(html).toContain(`aria-label="${t.background}"`);
    expect(html).toContain(`aria-label="${t.textColor}"`);
  });

  test('renders swatches with role group and aria-pressed', () => {
    const html = renderMarkup();
    expect(html).toContain('aria-label="Fondo swatches"');
    expect(html).toContain('aria-label="Color de texto swatches"');
    expect(html).toMatch(/aria-pressed="(true|false)"/);
  });

  test('tabs render with roles and selected state', () => {
    const html = renderMarkup();
    const tabsCount = (html.match(/role="tab"/g) || []).length;
    expect(tabsCount).toBeGreaterThan(0);
    expect(html).toContain('role="tablist"');
    expect(html).toMatch(/aria-selected="(true|false)"/);
  });

  test('server-side render time is consistent', () => {
    const start = process.hrtime.bigint();
    renderMarkup();
    const end = process.hrtime.bigint();
    const ms = Number(end - start) / 1_000_000;
    expect(ms).toBeLessThan(100);
  });
});
