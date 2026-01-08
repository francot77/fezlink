import { SupportedLanguage } from '@/types/i18n';
import { LanguageSection } from './LanguageSection';
import { SessionSection } from './SessionSection';
import { TwoFactorSection } from './TwoFactorSection';
import { AccountSection } from './AccountSection';
import { ChangePasswordSection } from './ChangePasswordSection';
import { DeleteAccountSection } from './DeleteAccountSection';

interface ConfigSectionProps {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  translations?: Record<string, any>;
}

export default function ConfigSection({ language, setLanguage, translations }: ConfigSectionProps) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Configuration</h2>
        <p className="text-sm sm:text-base text-gray-400">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Unified Panel */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
          {/* Account Info */}
          <AccountSection translations={translations?.account} />

          {/* Security & Preferences Group */}
          <TwoFactorSection translations={translations?.twoFactor} />
          <ChangePasswordSection translations={translations?.account} />
          <SessionSection translations={translations?.session} />
          <LanguageSection
            language={language}
            setLanguage={setLanguage}
            translations={translations?.language}
          />
        </div>

        {/* Danger Zone - Separate for safety */}
        <div className="bg-red-500/5 border border-red-500/10 rounded-xl overflow-hidden">
          <DeleteAccountSection translations={translations?.account} />
        </div>
      </div>
    </div>
  );
}
