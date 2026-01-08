import { useState } from 'react';
import { User, CheckCircle, XCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { SectionCard } from '@/features/biopage/SectionCard';

interface AccountSectionProps {
  translations?: any;
}

export function AccountSection({ translations: t = {} }: AccountSectionProps) {
  const { data: session } = useSession();
  const isVerified = session?.user?.isVerified;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10 shrink-0">
          <User size={18} className="text-gray-300" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-white">{t.accountInfoTitle || 'Account Information'}</h3>
          <p className="text-xs text-gray-400">{session?.user?.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-2.5 py-1 w-fit rounded-md bg-black/40 border border-white/10 self-start sm:self-center">
        {isVerified ? (
          <>
            <CheckCircle size={14} className="text-green-500" />
            <span className="text-xs font-medium text-green-500">Verified</span>
          </>
        ) : (
          <>
            <XCircle size={14} className="text-yellow-500" />
            <span className="text-xs font-medium text-yellow-500">Not Verified</span>
          </>
        )}
      </div>
    </div>
  );
}
