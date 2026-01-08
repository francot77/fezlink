'use client';

import { useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import Button from '@/components/button';
import { SupportedLanguage } from '@/types/i18n';
import { BIOPAGE_TRANSLATIONS, DEFAULT_AVATAR } from '@/lib/biopage-constants';
import { useBiopage } from '@/hooks/useBiopage';
import { ProfileSection } from '@/features/biopage/ProfileSection';
import { AvatarModal } from '@/features/biopage/AvatarModal';
import { UsernameModal } from '@/features/biopage/UsernameModal';

interface ProfileEditorProps {
  language?: SupportedLanguage;
}

export default function ProfileEditor({ language = 'en' }: ProfileEditorProps) {
  const t = useMemo(() => BIOPAGE_TRANSLATIONS[language], [language]);

  const {
    user,
    biopage,
    loading,
    isPremium,
    avatarUrl,
    description,
    setAvatarUrl,
    setDescription,
    setBiopage,
    saveBiopage,
    changeSlug,
  } = useBiopage(t);

  const [avatarModal, setAvatarModal] = useState(false);
  const [usernameModal, setUsernameModal] = useState(false);
  const [inputSlug, setInputSlug] = useState('');

  const handleUsernameChange = async () => {
    const success = await changeSlug(inputSlug);
    if (success) {
      setUsernameModal(false);
      setInputSlug('');
    }
  };

  const handleAvatarUpload = (url: string) => {
    setAvatarUrl(url);
    setBiopage((prev) => (prev ? { ...prev, avatarUrl: url } : prev));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 to-black/60 px-6 py-12 backdrop-blur-xl">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
        <span className="text-gray-300">{t.loading}</span>
      </div>
    );
  }

  if (!user) {
    return <div className="p-6 text-red-300">{t.unauthorized}</div>;
  }

  if (!biopage) {
    return (
      <div className="p-6 text-center text-gray-400">
        {t.noBiopage}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AvatarModal
        isOpen={avatarModal}
        onClose={() => setAvatarModal(false)}
        avatarUrl={avatarUrl}
        defaultAvatar={DEFAULT_AVATAR}
        onUploadComplete={handleAvatarUpload}
        translations={t}
      />

      <UsernameModal
        isOpen={usernameModal}
        onClose={() => setUsernameModal(false)}
        onAccept={handleUsernameChange}
        inputSlug={inputSlug}
        setInputSlug={setInputSlug}
        translations={t}
      />

      <ProfileSection
        slug={biopage.slug}
        isPremium={isPremium}
        avatarUrl={avatarUrl}
        defaultAvatar={DEFAULT_AVATAR}
        description={description}
        onAvatarClick={() => setAvatarModal(true)}
        onUsernameClick={() => setUsernameModal(true)}
        onDescriptionChange={setDescription}
        translations={t}
      />

      <div className="flex justify-end pt-4">
        <Button
          title={t.saveBiopage}
          onClick={() => saveBiopage()}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] hover:bg-emerald-500 hover:shadow-emerald-500/30 active:scale-[0.98]"
        >
          <Save size={20} />
          {t.saveBiopage}
        </Button>
      </div>
    </div>
  );
}
