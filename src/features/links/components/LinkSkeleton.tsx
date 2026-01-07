import { Skeleton } from '@/shared/ui';

export const LinkSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl">
    <div className="p-6 space-y-4">
      <div className="flex items-start gap-3">
        <Skeleton width={48} height={48} rounded="rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton width={80} height={12} />
          <Skeleton width={192} height={20} className="bg-white/10" />
        </div>
        <Skeleton width={64} height={28} rounded="rounded-full" />
      </div>
      <Skeleton height={40} className="w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton width={96} height={12} />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={80} rounded="rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  </div>
);
