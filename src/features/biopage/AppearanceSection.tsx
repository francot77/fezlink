import { Palette, Save } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { TabsNavigation } from './components/TabsNavigation';
import { ColorPickerTab } from './components/ColorPickerTab';
import { GradientPickerTab } from './components/GradientPickerTab';
import { ImagePickerTab } from './components/ImagePickerTab';
import { useAppearance } from './hooks/useAppearance';

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
  const { activeTab, setActiveTab } = useAppearance();

  return (
    <SectionCard title={t.appearanceTitle} description={t.appearanceDescription} icon={Palette}>
      <div className="space-y-4">
        {/* Tabs Navigation */}
        <TabsNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          labels={{
            colors: t.customColor || 'Colors',
            gradients: t.gradients || 'Gradients',
            image: t.backgroundImage || 'Image',
          }}
        />

        {/* Tab Content */}
        <div className="min-h-[200px]">
          {/* COLORS TAB */}
          {activeTab === 'colors' && (
            <ColorPickerTab
              bgColor={bgColor}
              textColor={textColor}
              onBgColorChange={onBgColorChange}
              onTextColorChange={onTextColorChange}
              translations={{
                background: t.background || 'Background',
                textColor: t.textColor || 'Text',
                customColor: t.customColor || 'Custom color',
                preview: t.preview || 'Preview',
              }}
            />
          )}

          {/* GRADIENTS TAB */}
          {activeTab === 'gradients' && (
            <GradientPickerTab
              gradients={gradients}
              bgColor={bgColor}
              isPremium={isPremium}
              onBgColorChange={onBgColorChange}
            />
          )}

          {/* IMAGE TAB */}
          {activeTab === 'image' && (
            <ImagePickerTab
              backgroundImageUrl={backgroundImageUrl}
              backgroundBlur={backgroundBlur}
              backgroundZoom={backgroundZoom}
              positionX={positionX}
              positionY={positionY}
              isPremium={isPremium}
              onBackgroundImageChange={onBackgroundImageChange}
              onBackgroundBlurChange={onBackgroundBlurChange}
              onBackgroundZoomChange={onBackgroundZoomChange}
              onBackgroundPositionX={onBackgroundPositionX}
              onBackgroundPositionY={onBackgroundPositionY}
            />
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
