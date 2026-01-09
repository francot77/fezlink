import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Button from '@/components/button';
import { useTranslations } from 'next-intl';

interface LogoutSectionProps {
  translations?: Record<string, string>;
}

export function LogoutSection({ translations: tProps = {} }: LogoutSectionProps) {
  const t = useTranslations('logout');
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10 shrink-0">
          <LogOut size={18} className="text-gray-300" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-white">{t('title')}</h3>
          <p className="text-xs text-gray-400">{t('description')}</p>
        </div>
      </div>

      <div className="w-full sm:w-auto">
        <Button
          onClick={handleLogout}
          disabled={loading}
          variant="secondary"
          className="w-full sm:w-auto justify-center"
        >
          {loading ? t('processing') : t('button')}
        </Button>
      </div>
    </div>
  );
}
