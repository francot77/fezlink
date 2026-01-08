/* eslint-disable no-unused-vars */
import { Droplet, Image as ImageIcon, Sparkles } from 'lucide-react';

export type TabType = 'colors' | 'gradients' | 'image';

interface TabsNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  labels: {
    colors: string;
    gradients: string;
    image: string;
  };
}

export const TabsNavigation = ({ activeTab, onTabChange, labels }: TabsNavigationProps) => {
  const tabs = [
    { id: 'colors' as TabType, label: labels.colors, icon: Droplet },
    { id: 'gradients' as TabType, label: labels.gradients, icon: Sparkles },
    { id: 'image' as TabType, label: labels.image, icon: ImageIcon },
  ];

  return (
    <div
      className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10"
      role="tablist"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                const order: TabType[] = ['colors', 'gradients', 'image'];
                const currentIndex = order.indexOf(activeTab);
                const nextIndex =
                  e.key === 'ArrowRight'
                    ? (currentIndex + 1) % order.length
                    : (currentIndex - 1 + order.length) % order.length;
                onTabChange(order[nextIndex]);
                e.preventDefault();
              }
            }}
            role="tab"
            aria-selected={activeTab === tab.id}
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
  );
};
