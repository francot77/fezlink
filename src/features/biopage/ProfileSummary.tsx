import { User, Edit } from 'lucide-react';
import { SectionCard } from './SectionCard';
import Button from '@/components/button';
import Image from 'next/image';

interface ProfileSummaryProps {
  slug: string;
  avatarUrl: string;
  defaultAvatar: string;
  description: string;
  onEditProfile: () => void;
  translations: Record<string, string>;
}

export function ProfileSummary({
  slug,
  avatarUrl,
  defaultAvatar,
  description,
  onEditProfile,
  translations: t,
}: ProfileSummaryProps) {
  return (
    <SectionCard title={t.profileTitle} description={t.profileDescription} icon={User}>
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl ring-2 ring-emerald-400/50">
          <Image
            src={avatarUrl || defaultAvatar}
            alt="avatar"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 96px, 96px"
          />
        </div>
        <div className="flex-1 space-y-2 w-full sm:w-auto">
          <h2 className="text-2xl font-bold text-white break-all">@{slug}</h2>
          <p className="text-gray-400 line-clamp-2">{description || t.descriptionPlaceholder}</p>
        </div>
        <Button
          title={t.profileTitle}
          onClick={onEditProfile}
          className="flex items-center gap-2 rounded-lg bg-emerald-600/20 px-4 py-2 text-emerald-400 ring-1 ring-emerald-500/50 transition hover:bg-emerald-600/30"
        >
          <Edit size={16} />
          {t.profileTitle}
        </Button>
      </div>
    </SectionCard>
  );
}
