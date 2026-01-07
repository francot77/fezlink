/* eslint-disable no-unused-vars */
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { useState } from 'react';
import CompactSlider from '@/components/CompactSlider';
import { PremiumLock } from './GradientPickerTab';

interface ImagePickerTabProps {
  backgroundImageUrl?: string;
  backgroundBlur: number;
  backgroundZoom: number;
  positionX: number;
  positionY: number;
  isPremium: boolean;
  onBackgroundImageChange: (url: string) => void;
  onBackgroundBlurChange: (value: number) => void;
  onBackgroundZoomChange: (value: number) => void;
  onBackgroundPositionX: (value: number) => void;
  onBackgroundPositionY: (value: number) => void;
}

export const ImagePickerTab = ({
  backgroundImageUrl,
  backgroundBlur,
  backgroundZoom,
  positionX,
  positionY,
  isPremium,
  onBackgroundImageChange,
  onBackgroundBlurChange,
  onBackgroundZoomChange,
  onBackgroundPositionX,
  onBackgroundPositionY,
}: ImagePickerTabProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/background-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        onBackgroundImageChange(data.url);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <PremiumLock locked={!isPremium}>
      <div className="space-y-3 animate-fade-in">
        {backgroundImageUrl ? (
          <>
            {/* Current Image Info + Actions */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                    <ImageIcon size={16} className="text-cyan-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-300">Background Active</span>
                </div>
                <div className="flex gap-2">
                  <label className="flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-medium text-gray-300 transition hover:border-cyan-400/50 hover:text-white">
                    <Upload size={12} />
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </label>
                  <button
                    onClick={() => onBackgroundImageChange('')}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 transition hover:bg-red-500/20"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Compact Controls */}
              <div className="space-y-2">
                <CompactSlider
                  label="Blur"
                  value={backgroundBlur}
                  onChange={onBackgroundBlurChange}
                  min={0}
                  max={10}
                  unit="px"
                />
                <CompactSlider
                  label="Zoom"
                  value={backgroundZoom}
                  onChange={onBackgroundZoomChange}
                  min={-100}
                  max={300}
                  step={1}
                  unit="%"
                />
                <CompactSlider
                  label="Position X"
                  value={positionX}
                  onChange={onBackgroundPositionX}
                  min={-50}
                  max={50}
                  step={0.5}
                  unit="%"
                />
                <CompactSlider
                  label="Position Y"
                  value={positionY}
                  onChange={onBackgroundPositionY}
                  min={-50}
                  max={50}
                  step={0.5}
                  unit="%"
                />
              </div>
            </div>
          </>
        ) : (
          <label className="group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/10 bg-white/5 p-6 transition hover:border-cyan-400/50 hover:bg-white/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110">
              <ImageIcon size={20} className="text-cyan-400" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-white">Upload background</p>
              <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              </div>
            )}
          </label>
        )}
      </div>
    </PremiumLock>
  );
};
