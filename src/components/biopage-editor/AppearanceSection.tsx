
import { Palette, Check, Save, Image as ImageIcon, Droplet, Sparkles, X } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { useState } from 'react';
import Slider from '../Slider';

interface AppearanceSectionProps {
    bgColor: string;
    textColor: string;
    slug: string;
    gradients: readonly { label: string; value: string }[];
    backgroundImageUrl?: string;
    backgroundBlur: number;
    backgroundZoom: number;
    isPremium: boolean;
    positionX: number;
    positionY: number;
    onBgColorChange: (value: string) => void;
    onTextColorChange: (value: string) => void;
    onBackgroundImageChange: (url: string) => void;
    onBackgroundBlurChange: (value: number) => void;
    onBackgroundZoomChange: (value: number) => void;
    onBackgroundPositionX: (value: number) => void;
    onBackgroundPositionY: (value: number) => void;
    onSave: () => void;
    translations: Record<string, string>;
}

type TabType = 'colors' | 'gradients' | 'image';

function PremiumLock({
    locked,
    children,
}: {
    locked: boolean;
    children: React.ReactNode;
}) {
    if (!locked) return <>{children}</>;

    return (
        <div className="relative">
            <div className="pointer-events-none opacity-40 blur-[1px]">
                {children}
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-xl bg-black/70 px-4 py-2 text-xs font-semibold text-white shadow-lg flex items-center gap-2">
                    <Sparkles size={14} className="text-emerald-400" />
                    Premium feature
                </div>
            </div>
        </div>
    );
}

export function AppearanceSection({
    bgColor,
    textColor,

    gradients,
    backgroundImageUrl,
    backgroundBlur,
    backgroundZoom,
    isPremium,
    positionX,
    positionY,
    onBgColorChange,
    onTextColorChange,
    onBackgroundImageChange,
    onBackgroundBlurChange,
    onBackgroundZoomChange,
    onBackgroundPositionX,
    onBackgroundPositionY,
    onSave,
    translations: t,
}: AppearanceSectionProps) {
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('colors');

    const tabs = [
        { id: 'colors' as TabType, label: t.customColor || 'Colors', icon: Droplet },
        { id: 'gradients' as TabType, label: t.gradients || 'Gradients', icon: Sparkles },
        { id: 'image' as TabType, label: t.backgroundImage || 'Image', icon: ImageIcon },
    ];

    return (
        <SectionCard
            title={t.appearanceTitle}
            description={t.appearanceDescription}
            icon={Palette}
        >
            <div className="space-y-6">
                {/* Tabs Navigation */}
                <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon size={16} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="min-h-[300px]">
                    {/* COLORS TAB */}
                    {activeTab === 'colors' && (
                        <div className="space-y-4 animate-fade-in">
                            {/* Background Color */}
                            <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                    <Palette size={16} className="text-emerald-400" />
                                    Background Color
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={bgColor.startsWith('#') ? bgColor : '#000000'}
                                        onChange={(e) => onBgColorChange(e.target.value)}
                                        className="h-16 w-16 cursor-pointer rounded-xl border-2 border-white/20 transition hover:border-emerald-400/50"
                                    />
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            value={bgColor}
                                            onChange={(e) => onBgColorChange(e.target.value)}
                                            placeholder="#000000"
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 transition focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                        <p className="text-xs text-gray-500">{t.colorHelp}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Text Color */}
                            <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                    <Droplet size={16} className="text-purple-400" />
                                    Text Color
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={textColor.startsWith('#') ? textColor : '#ffffff'}
                                        onChange={(e) => onTextColorChange(e.target.value)}
                                        className="h-16 w-16 cursor-pointer rounded-xl border-2 border-white/20 transition hover:border-purple-400/50"
                                    />
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            value={textColor}
                                            onChange={(e) => onTextColorChange(e.target.value)}
                                            placeholder="#ffffff"
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 transition focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                        />
                                        <p className="text-xs text-gray-500">{t.colorHelp}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* GRADIENTS TAB */}
                    {activeTab === 'gradients' && (
                        <PremiumLock locked={!isPremium}>
                            <div className="space-y-4 animate-fade-in">
                                <p className="text-sm text-gray-400">
                                    Select a gradient theme for your background
                                </p>

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
                    )}


                    {/* IMAGE TAB */}
                    {activeTab === 'image' && (
                        <PremiumLock locked={!isPremium}>
                            <div className="space-y-4 animate-fade-in">
                                {/* Image Upload */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                        <ImageIcon size={16} className="text-cyan-400" />
                                        Background Image
                                    </label>

                                    {backgroundImageUrl ? (
                                        <div className="space-y-4">
                                            {/* Image Preview */}
                                            <div className="relative h-48 rounded-xl overflow-hidden border border-white/10 bg-black/30">
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                                                    style={{
                                                        backgroundImage: `url(${backgroundImageUrl})`,
                                                        filter: `blur(${backgroundBlur}px)`
                                                    }}
                                                />
                                                {uploading && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                                                    </div>
                                                )}

                                                {/* Remove button */}
                                                <button
                                                    onClick={() => onBackgroundImageChange('')}
                                                    className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-500/80 backdrop-blur-sm transition hover:bg-red-500"
                                                >
                                                    <X size={16} className="text-white" />
                                                </button>
                                            </div>

                                            {/* Blur Slider */}
                                            <Slider min={0} minLabel='Sharp' maxLabel='Blurred' max={10} unit='px' label='Blur' value={backgroundBlur} onChange={onBackgroundBlurChange} />
                                            <Slider min={-50} minLabel='Left' maxLabel='Right' step={0.1} max={50} unit='%' label='Position Horizontal' value={positionX} onChange={onBackgroundPositionX} />
                                            <Slider min={-50} minLabel='Top' maxLabel='Bottom' step={0.1} max={50} unit='%' label='Position Vertical' value={positionY} onChange={onBackgroundPositionY} />
                                            <Slider min={-100} minLabel='Close' maxLabel='Far' step={0.1} max={300} unit='%' label='Zoom' value={backgroundZoom} onChange={onBackgroundZoomChange} />
                                            {/* Change Image Button */}
                                            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-300 transition hover:border-cyan-400/50 hover:bg-white/10">
                                                <ImageIcon size={16} />
                                                Change Image
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={async (e) => {
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
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        <label className="group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-white/10 bg-white/5 p-8 transition hover:border-cyan-400/50 hover:bg-white/10">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110">
                                                <ImageIcon size={28} className="text-cyan-400" />
                                            </div>
                                            <div className="text-center space-y-1">
                                                <p className="text-sm font-medium text-white">Upload background image</p>
                                                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={async (e) => {
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
                                                }}
                                            />
                                            {uploading && (
                                                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm">
                                                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                                                </div>
                                            )}
                                        </label>
                                    )}
                                </div>
                            </div> </PremiumLock>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                <button
                    onClick={onSave}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/40"
                >
                    <Save size={18} />
                    {t.saveBiopage}
                </button>

            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }

                /* Custom range slider styling */
                input[type="range"]::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    background: linear-gradient(135deg, #10b981, #06b6d4);
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
                    transition: all 0.2s;
                }

                input[type="range"]::-webkit-slider-thumb:hover {
                    transform: scale(1.2);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.6);
                }

                input[type="range"]::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    background: linear-gradient(135deg, #10b981, #06b6d4);
                    border-radius: 50%;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
                    transition: all 0.2s;
                }

                input[type="range"]::-moz-range-thumb:hover {
                    transform: scale(1.2);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.6);
                }
            `}</style>
        </SectionCard>
    );
}