import { SupportedLanguage } from '@/types/i18n';
import { Globe } from 'lucide-react';
import { SectionCard } from '@/features/biopage/SectionCard';
import { Select } from '@/shared/ui/Select';

interface LanguageSectionProps {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  translations?: Record<string, string>;
}

export function LanguageSection({ language, setLanguage, translations: t = {} }: LanguageSectionProps) {
  const options = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10 shrink-0">
          <Globe size={18} className="text-gray-300" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-white">{t.languageTitle || 'Language'}</h3>
          <p className="text-xs text-gray-400">{t.languageDescription || 'Select your preferred language.'}</p>
        </div>
      </div>

      <div className="w-full sm:w-48">
        <Select
          value={language}
          onChange={(val) => setLanguage(val as SupportedLanguage)}
          options={options}
          placeholder="Select language"
          accent="cyan"
          className="text-sm"
        />
      </div>
    </div>
  );
}
