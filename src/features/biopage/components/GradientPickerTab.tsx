/* eslint-disable no-unused-vars */
import { Check, Sparkles } from 'lucide-react';
import React from 'react';

interface PremiumLockProps {
  locked: boolean;
  children: React.ReactNode;
}

export function PremiumLock({ locked, children }: PremiumLockProps) {
  if (!locked) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-40 blur-[1px]">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="rounded-xl bg-black/80 backdrop-blur-sm px-4 py-2 text-xs font-semibold text-white shadow-lg flex items-center gap-2 border border-emerald-500/30">
          <Sparkles size={14} className="text-emerald-400" />
          Premium feature
        </div>
      </div>
    </div>
  );
}

interface GradientPickerTabProps {
  gradients: readonly { label: string; value: string }[];
  bgColor: string;
  isPremium: boolean;
  onBgColorChange: (value: string) => void;
}

export const GradientPickerTab = ({
  gradients,
  bgColor,
  isPremium,
  onBgColorChange,
}: GradientPickerTabProps) => {
  return (
    <PremiumLock locked={!isPremium}>
      <div className="space-y-4 w-full sm:w-3/4">
        <p className="text-sm text-gray-400">Select a gradient theme for your background</p>

        <div className="grid grid-cols-3 overflow-y-auto max-h-64 gap-3 sm:grid-cols-3 lg:grid-cols-4 p-3 scrollbar-thin">
          {gradients.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                if (!isPremium) return;
                onBgColorChange(preset.value);
              }}
              className={`group relative overflow-hidden rounded-xl h-24 transition-all duration-300 ${bgColor === preset.value
                ? 'ring-2 ring-emerald-400 shadow-xl shadow-emerald-500/20'
                : 'ring-1 ring-white/10 hover:ring-white/20'
                }`}
              style={{ backgroundImage: preset.value }}
            >
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative h-full flex flex-col justify-between p-3">
                {bgColor === preset.value && (
                  <div className="flex justify-end">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                      <Check size={14} className="text-white" />
                    </div>
                  </div>
                )}
                <span className="text-xs font-semibold text-white drop-shadow-lg">
                  {preset.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </PremiumLock>
  );
};
