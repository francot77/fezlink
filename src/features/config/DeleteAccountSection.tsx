import { useState } from 'react';
import { Trash2, AlertTriangle, ChevronRight } from 'lucide-react';
import Button from '@/components/button';
import { toast } from 'sonner';
import { signOut } from 'next-auth/react';

interface DeleteAccountSectionProps {
  translations?: any;
}

export function DeleteAccountSection({ translations: t = {} }: DeleteAccountSectionProps) {
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDeleteAccount = async () => {
    if (!deletePassword) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to delete account');

      toast.success('Account deleted successfully');
      signOut({ callbackUrl: '/' });
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div>
        <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-4 hover:bg-red-500/10 transition-colors text-left group"
        >
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 ring-1 ring-red-500/20 shrink-0">
                    <Trash2 size={18} className="text-red-400" />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-red-200 group-hover:text-red-100 transition-colors">{t.deleteAccountTitle || 'Delete Account'}</h3>
                    <p className="text-xs text-red-200/60 group-hover:text-red-200/80 transition-colors">{t.deleteAccountDesc || 'Permanently delete your account.'}</p>
                </div>
            </div>
            <div className={`p-1 text-red-400/60 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                <ChevronRight size={18} />
            </div>
        </button>

        {isExpanded && (
            <div className="p-4 pt-2 sm:pl-[68px]">
                {!showDeleteConfirm ? (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                            <AlertTriangle size={16} className="text-red-500" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-red-200">Danger Zone</h4>
                            <p className="text-xs text-red-200/60 leading-relaxed">
                            Once you delete your account, there is no going back. Please be certain.
                            </p>
                        </div>
                        </div>
                        <Button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-fit bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-xs px-4 py-2 h-auto"
                        >
                        Delete Account
                        </Button>
                    </div>
                    </div>
                ) : (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-white">Confirm Account Deletion</h4>
                        <p className="text-xs text-gray-300 leading-relaxed">
                        Enter password to confirm. <span className="font-bold text-red-400">Cannot be undone.</span>
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <input
                        type="password"
                        placeholder="Enter your password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="w-full rounded-lg bg-black/40 border border-red-500/30 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <div className="flex justify-end gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeletePassword('');
                            }}
                            className="text-xs px-3 py-2 h-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteAccount}
                            disabled={loading || !deletePassword}
                            className="bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-2 h-auto"
                        >
                            {loading ? 'Deleting...' : 'Confirm Deletion'}
                        </Button>
                        </div>
                    </div>
                    </div>
                )}
            </div>
        )}
    </div>
  );
}
