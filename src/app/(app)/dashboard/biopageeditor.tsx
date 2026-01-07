'use client';

import { useState, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import Button from '@/components/button';
import { SupportedLanguage } from '@/types/i18n';
import { BIOPAGE_TRANSLATIONS, GRADIENT_PRESETS, DEFAULT_AVATAR } from '@/lib/biopage-constants';
import { useBiopage } from '@/hooks/useBiopage';
import { useBiopageLinks } from '@/hooks/useBiopageLinks';
import { ProfileSection } from '@/features/biopage/ProfileSection';
import { LinksSection } from '@/features/biopage/LinksSection';
import { AppearanceSection } from '@/features/biopage/AppearanceSection';
import { AvatarModal } from '@/features/biopage/AvatarModal';
import { UsernameModal } from '@/features/biopage/UsernameModal';
import BiopagePreview from '@/features/biopage/BiopagePreview';

interface BiopageEditorProps {
  language?: SupportedLanguage;
}

export default function BiopageEditor({ language = 'en' }: BiopageEditorProps) {
  const t = useMemo(() => BIOPAGE_TRANSLATIONS[language], [language]);

  // Biopage state and actions
  const {
    user,
    biopage,
    loading,
    isPremium,
    selected,
    bgColor,
    backgroundPositionX,
    backgroundPositionY,
    textColor,
    avatarUrl,
    description,
    backgroundImageUrl,
    backgroundBlur,
    backgroundZoom,
    setSelected,
    setBgColor,
    setTextColor,
    setAvatarUrl,
    setDescription,
    setBiopage,
    createBiopage,
    saveBiopage,
    changeSlug,
    handleBackgroundImageChange,
    setBackgroundZoom,
    setBackgroundBlur,
    setBackgroundPositionX,
    setBackgroundPositionY,
  } = useBiopage(t);

  // Links state and actions
  const { links, toggleSelect, updateLabel } = useBiopageLinks(user);
  // Modals state
  const [avatarModal, setAvatarModal] = useState(false);
  const [usernameModal, setUsernameModal] = useState(false);
  const [inputSlug, setInputSlug] = useState('');

  // Handlers
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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 to-black/60 px-6 py-12 backdrop-blur-xl">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
        <span className="text-gray-300">{t.loading}</span>
      </div>
    );
  }

  // Unauthorized state
  if (!user) {
    return <div className="p-6 text-red-300">{t.unauthorized}</div>;
  }

  // No biopage state
  if (!biopage) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" />
        <div className="relative flex flex-col items-center justify-center gap-6 p-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 ring-1 ring-white/10">
            <Sparkles size={40} className="text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">{t.noBiopage}</h1>
            <p className="text-gray-400 max-w-md">{t.wantGenerate}</p>
          </div>
          <Button
            title={t.generate}
            onClick={createBiopage}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3 font-semibold shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/40"
          >
            <Sparkles size={18} />
            {t.generate}
          </Button>
        </div>
      </div>
    );
  }

  // Main editor
  return (
    <div className="space-y-6 text-white">
      {/* Modals */}
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

      {/* Editor Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <div className="space-y-6">
          <ProfileSection
            slug={biopage.slug}
            isPremium={isPremium}
            avatarUrl={avatarUrl}
            defaultAvatar={DEFAULT_AVATAR}
            description={description}
            onAvatarClick={() => setAvatarModal(true)}
            onUsernameClick={() => setUsernameModal(true)}
            onDescriptionChange={setDescription}
            onAvatarUrlChange={setAvatarUrl}
            translations={t}
          />

          <LinksSection
            links={links}
            selected={selected}
            onToggle={(link) => toggleSelect(link, selected, setSelected)}
            onLabelChange={(shortUrl, value) => updateLabel(shortUrl, value, setSelected)}
            translations={t}
          />

          <AppearanceSection
            bgColor={bgColor}
            textColor={textColor}
            slug={biopage.slug}
            gradients={GRADIENT_PRESETS}
            isPremium={isPremium}
            backgroundImageUrl={backgroundImageUrl}
            backgroundBlur={backgroundBlur}
            onBackgroundImageChange={handleBackgroundImageChange}
            onBackgroundPositionX={setBackgroundPositionX}
            onBackgroundPositionY={setBackgroundPositionY}
            onBackgroundBlurChange={setBackgroundBlur}
            onBgColorChange={setBgColor}
            onTextColorChange={setTextColor}
            onSave={saveBiopage}
            translations={t}
            positionX={backgroundPositionX}
            positionY={backgroundPositionY}
            backgroundZoom={backgroundZoom}
            onBackgroundZoomChange={setBackgroundZoom}
          />
        </div>

        <BiopagePreview
          bgColor={bgColor}
          textColor={textColor}
          avatarUrl={avatarUrl}
          slug={biopage.slug}
          links={selected}
          description={description}
          language={language}
          backgroundZoom={backgroundZoom}
          backgroundImageUrl={backgroundImageUrl}
          backgroundBlur={backgroundBlur}
          backgroundPositionX={backgroundPositionX}
          backgroundPositionY={backgroundPositionY}
        />
      </div>
    </div>
  );
}
