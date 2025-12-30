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
    onAvatarUrlChange: (value: string) => void;
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
    onAvatarUrlChange,
    translations: t,
}: ProfileSectionProps) {
    return (
        <SectionCard title={t.profileTitle} description={t.profileDescription} icon={User}>
            <div className="grid gap-6 md:grid-cols-[auto,1fr] md:items-start">
                <button
                    type="button"
                    onClick={onAvatarClick}
                    className="group relative w-32 h-32 rounded-2xl overflow-hidden ring-2 ring-emerald-400/50 shadow-xl shadow-emerald-500/20 transition-all duration-300 hover:scale-105 hover:ring-emerald-400"
                >
                    <img src={avatarUrl || defaultAvatar} alt="avatar" className="w-full h-full object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Upload size={24} className="text-white" />
                    </span>
                </button>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold text-white">@{slug}</h2>
                            {isPremium ? (
                                <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 px-3 py-1 ring-1 ring-yellow-500/30">
                                    <Crown size={14} className="text-yellow-400" />
                                    <span className="text-xs font-semibold text-yellow-300">{t.premiumBadge}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 ring-1 ring-emerald-500/30">
                                    <span className="text-xs font-semibold text-emerald-300">{t.freeBadge}</span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-400">{t.premiumHint}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {isPremium && (
                            <button
                                onClick={onUsernameClick}
                                className="flex items-center gap-2 rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
                            >
                                <User size={16} />
                                {t.changeName}
                            </button>
                        )}
                        <Link
                            href={`/@${slug}`}
                            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ExternalLink size={16} />
                            {t.viewBiopage}
                        </Link>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300" htmlFor="description-textarea">
                                {t.descriptionLabel}
                            </label>
                            <textarea
                                id="description-textarea"
                                value={description}
                                onChange={(e) => onDescriptionChange(e.target.value)}
                                placeholder={t.descriptionPlaceholder}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur-sm transition focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[96px] resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300" htmlFor="avatar-url">
                                {t.avatarLabel}
                            </label>
                            <input
                                id="avatar-url"
                                type="url"
                                value={avatarUrl}
                                onChange={(e) => onAvatarUrlChange(e.target.value)}
                                placeholder={defaultAvatar}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur-sm transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </SectionCard>
    );
}