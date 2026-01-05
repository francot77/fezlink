import { Palette, Check, Save, Image as ImageIcon, Droplet, Sparkles, X, Upload } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { useState } from 'react';
import CompactSlider from '../CompactSlider';

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

            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="rounded-xl bg-black/80 backdrop-blur-sm px-4 py-2 text-xs font-semibold text-white shadow-lg flex items-center gap-2 border border-emerald-500/30">
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
        <SectionCard
            title={t.appearanceTitle}
            description={t.appearanceDescription}
            icon={Palette}
        >
            <div className="space-y-4">
                {/* Tabs Navigation */}
                <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon size={14} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="min-h-[200px]">
                    {/* COLORS TAB */}
                    {activeTab === 'colors' && (
                        <div className="space-y-3 animate-fade-in">
                            {/* Background & Text Color - Compact Side by Side */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Background Color */}
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <label className="flex items-center gap-2 text-xs font-medium text-gray-300 mb-2">
                                        <Palette size={14} className="text-emerald-400" />
                                        Background
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={bgColor.startsWith('#') ? bgColor : '#000000'}
                                            onChange={(e) => onBgColorChange(e.target.value)}
                                            className="h-10 w-10 cursor-pointer rounded-lg border border-white/20 transition hover:border-emerald-400/50"
                                        />
                                        <input
                                            type="text"
                                            value={bgColor}
                                            onChange={(e) => onBgColorChange(e.target.value)}
                                            placeholder="#000000"
                                            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-gray-500 transition focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                                        />
                                    </div>
                                </div>

                                {/* Text Color */}
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <label className="flex items-center gap-2 text-xs font-medium text-gray-300 mb-2">
                                        <Droplet size={14} className="text-purple-400" />
                                        Text
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={textColor.startsWith('#') ? textColor : '#ffffff'}
                                            onChange={(e) => onTextColorChange(e.target.value)}
                                            className="h-10 w-10 cursor-pointer rounded-lg border border-white/20 transition hover:border-purple-400/50"
                                        />
                                        <input
                                            type="text"
                                            value={textColor}
                                            onChange={(e) => onTextColorChange(e.target.value)}
                                            placeholder="#ffffff"
                                            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-gray-500 transition focus:border-purple-400/50 focus:outline-none focus:ring-1 focus:ring-purple-500/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* GRADIENTS TAB - Horizontal Scroll */}
                    {activeTab === 'gradients' && (
                        <PremiumLock locked={!isPremium}>
                            <div className="space-y-4 animate-fade-in">
                                <p className="text-sm text-gray-400">
                                    Select a gradient theme for your background
                                </p>

                                <div className="grid grid-cols-3 overflow-x-auto max-h-50 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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

                    {/* IMAGE TAB - Compact */}
                    {activeTab === 'image' && (
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
                    )}
                </div>

                {/* Save Button - Always Visible */}
                <button
                    onClick={onSave}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/40 active:scale-95"
                >
                    <Save size={16} />
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

                /* Horizontal scroll styling */
                .gradient-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
                }

                .gradient-scroll::-webkit-scrollbar {
                    height: 6px;
                }

                .gradient-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }

                .gradient-scroll::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                }

                .gradient-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </SectionCard>
    );
}