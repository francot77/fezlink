/* eslint-disable @next/next/no-img-element */
// src/components/biopage-editor/ProfileSection.tsx
import Link from 'next/link';
import { User, Upload, Crown, ExternalLink } from 'lucide-react';
import { SectionCard } from './SectionCard';

interface ProfileSectionProps {
  slug: string;
  isPremium: boolean;
  avatarUrl: string;
  defaultAvatar: string;
  description: string;
  onAvatarClick: () => void;
  onUsernameClick: () => void;
  onDescriptionChange: (value: string) => void;
  translations: Record<string, string>;
}

export function ProfileSection({
  slug,
  isPremium,
  avatarUrl,
  defaultAvatar,
  description,
  onAvatarClick,
  onUsernameClick,
  onDescriptionChange,
  translations: t,
}: ProfileSectionProps) {
  return (
    <SectionCard title={t.profileTitle} description={t.profileDescription} icon={User}>
      <div className="grid gap-8 md:grid-cols-[auto,1fr] md:items-start">
        <div className="flex justify-center md:justify-start">
          <button
            type="button"
            onClick={onAvatarClick}
            className="group/avatar relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden ring-4 ring-emerald-400/30 shadow-2xl shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] hover:ring-emerald-400 hover:shadow-emerald-500/40"
          >
            <img
              src={avatarUrl || defaultAvatar}
              alt="avatar"
              className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] opacity-0 transition-all duration-300 group-hover/avatar:opacity-100">
              <Upload size={32} className="text-white drop-shadow-lg transform scale-75 transition-transform duration-300 group-hover/avatar:scale-100" />
            </div>
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">@{slug}</h2>
              {isPremium ? (
                <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 px-3 py-1 ring-1 ring-yellow-500/30 shadow-[0_0_15px_-3px_rgba(234,179,8,0.3)]">
                  <Crown size={14} className="text-yellow-400" />
                  <span className="text-xs font-bold tracking-wide text-yellow-300 uppercase">{t.premiumBadge}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 ring-1 ring-emerald-500/20">
                  <span className="text-xs font-bold tracking-wide text-emerald-400 uppercase">{t.freeBadge}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-400 max-w-md mx-auto md:mx-0">{t.premiumHint}</p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            {isPremium && (
              <button
                onClick={onUsernameClick}
                className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-5 py-2.5 text-sm font-medium text-cyan-300 transition-all hover:bg-cyan-500/10 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10 active:scale-95"
              >
                <User size={18} />
                {t.changeName}
              </button>
            )}
            <Link
              href={`/@${slug}`}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-300 transition-all hover:bg-white/10 hover:border-white/20 hover:text-white active:scale-95"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={18} />
              {t.viewBiopage}
            </Link>
          </div>

          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1" htmlFor="description-textarea">
                {t.descriptionLabel}
              </label>
              <div className="relative group">
                <textarea
                  id="description-textarea"
                  value={description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  placeholder={t.descriptionPlaceholder}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-gray-600 backdrop-blur-sm transition-all focus:border-emerald-500/50 focus:bg-black/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[120px] resize-none"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 opacity-0 pointer-events-none transition-opacity duration-300 group-focus-within:opacity-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
