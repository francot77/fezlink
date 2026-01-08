import { useState } from 'react';
import { LogOut, AlertTriangle, ChevronRight } from 'lucide-react';
import Button from '@/components/button';
import { signOut } from 'next-auth/react';

interface SessionSectionProps {
  translations?: Record<string, string>;
}

export function SessionSection({ translations: t = {} }: SessionSectionProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLogoutAll = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/logout-all', {
        method: 'POST',
      });

      if (res.ok) {
        // Force client-side logout to clear cookies and redirect
        await signOut({ callbackUrl: '/login' });
      } else {
        console.error('Failed to logout all devices');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error logging out all devices:', error);
      setLoading(false);
    }
  };

  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10 shrink-0">
            <LogOut size={18} className="text-gray-300" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">{t.sessionTitle || 'Session Management'}</h3>
            <p className="text-xs text-gray-400">{t.sessionDescription || 'Manage active sessions.'}</p>
          </div>
        </div>
        <div className={`p-1 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
          <ChevronRight size={18} />
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 pt-2 sm:pl-[68px]">
          <div className="space-y-4">
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="mt-0.5 rounded-full bg-yellow-500/20 p-1.5 h-fit w-fit ring-1 ring-yellow-500/30">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold text-yellow-200">{t.logoutAllWarningTitle || 'Important'}</p>
                  <p className="text-xs text-yellow-200/80 leading-relaxed">
                    {t.logoutAllWarningText || 'This will sign you out from all devices, including this one.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              {!showConfirm ? (
                <Button
                  variant="secondary"
                  onClick={() => setShowConfirm(true)}
                  className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition-all hover:bg-red-500/20 hover:border-red-500/30"
                >
                  <LogOut size={14} className="transition-transform group-hover:-translate-x-0.5" />
                  {t.logoutAllButton || 'Log out all devices'}
                </Button>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto animate-in fade-in slide-in-from-right-4 duration-300">
                  <span className="hidden sm:inline text-xs text-gray-400 mr-1">{t.areYouSure || 'Sure?'}</span>
                  <Button
                    variant="secondary"
                    onClick={() => setShowConfirm(false)}
                    className="w-full sm:w-auto rounded-lg px-3 py-2 text-xs font-medium hover:bg-white/5"
                  >
                    {t.cancel || 'Cancel'}
                  </Button>
                  <Button
                    onClick={handleLogoutAll}
                    disabled={loading}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 hover:shadow-red-500/30 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <LogOut size={12} />
                    )}
                    {t.confirmLogout || 'Yes, Log out all'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
