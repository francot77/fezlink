/* eslint-disable no-unused-vars */
import { Droplet, Palette } from 'lucide-react';
import BackgroundPreview from '../BackgroundPreview';

interface ColorPickerProps {
  bgColor: string;
  textColor: string;
  onBgColorChange: (value: string) => void;
  onTextColorChange: (value: string) => void;
  translations: {
    background: string;
    textColor: string;
    customColor: string;
    preview: string;
  };
}

const PRESET_COLORS = [
  '#000000',
  '#ffffff',
  '#0ea5e9',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#e11d48',
  '#374151',
  '#f97316',
];

const TEXT_COLORS = [
  '#ffffff',
  '#000000',
  '#f9fafb',
  '#111827',
  '#e5e7eb',
  '#374151',
  '#d1d5db',
  '#1f2937',
  '#cbd5e1',
  '#0f172a',
  '#94a3b8',
  '#020617',
];

export const ColorPickerTab = ({
  bgColor,
  textColor,
  onBgColorChange,
  onTextColorChange,
  translations: t,
}: ColorPickerProps) => {
  return (
    <div className="space-y-3 w-full sm:w-3/4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Background Color */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <label className="flex items-center gap-2 text-xs font-medium text-gray-300 mb-2">
            <Palette size={14} className="text-emerald-400" />
            {t.background}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={bgColor.startsWith('#') ? bgColor : '#000000'}
              onChange={(e) => onBgColorChange(e.target.value)}
              aria-label={t.background}
              title={t.background}
              className="h-10 w-10 cursor-pointer rounded-lg border border-white/20 transition hover:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
            />
            <div className="flex items-center gap-2" aria-live="polite" aria-atomic="true">
              <span className="text-xs text-gray-400">{t.preview}</span>
              <BackgroundPreview
                bgColor={bgColor}
                className="h-6 w-10 rounded-md ring-1 ring-white/20"
                ariaLabel={t.background + ' preview'}
              />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[11px] text-gray-400 mb-2">{t.customColor}</p>
            <div
              className="grid grid-cols-6 gap-2"
              role="group"
              aria-label={t.background + ' swatches'}
            >
              {PRESET_COLORS.map((sw) => (
                <button
                  key={sw}
                  type="button"
                  onClick={() => onBgColorChange(sw)}
                  className={`h-6 w-6 rounded-md ring-1 transition ${bgColor === sw ? 'ring-2 ring-emerald-400 scale-105' : 'ring-white/10 hover:ring-white/20'}`}
                  style={{ background: sw }}
                  aria-label={t.background + ' swatch'}
                  aria-pressed={bgColor === sw}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Text Color */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <label className="flex items-center gap-2 text-xs font-medium text-gray-300 mb-2">
            <Droplet size={14} className="text-purple-400" />
            {t.textColor}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={textColor.startsWith('#') ? textColor : '#ffffff'}
              onChange={(e) => onTextColorChange(e.target.value)}
              aria-label={t.textColor}
              title={t.textColor}
              className="h-10 w-10 cursor-pointer rounded-lg border border-white/20 transition hover:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
            />
            <div className="flex items-center gap-2" aria-live="polite" aria-atomic="true">
              <span className="text-xs text-gray-400">{t.preview}</span>
              <div
                className="h-6 w-10 rounded-md ring-1 ring-white/20"
                style={{ background: textColor }}
                aria-label={t.textColor + ' preview'}
              />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[11px] text-gray-400 mb-2">{t.customColor}</p>
            <div
              className="grid grid-cols-6 gap-2"
              role="group"
              aria-label={t.textColor + ' swatches'}
            >
              {TEXT_COLORS.map((sw) => (
                <button
                  key={sw}
                  type="button"
                  onClick={() => onTextColorChange(sw)}
                  className={`h-6 w-6 rounded-md ring-1 transition ${textColor === sw ? 'ring-2 ring-purple-400 scale-105' : 'ring-white/10 hover:ring-white/20'}`}
                  style={{ background: sw }}
                  aria-label={t.textColor + ' swatch'}
                  aria-pressed={textColor === sw}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
