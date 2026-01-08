import { useState } from 'react';
import { Lock, ChevronRight } from 'lucide-react';
import Button from '@/components/button';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface ChangePasswordSectionProps {
  translations?: any;
}

export function ChangePasswordSection({ translations: t = {} }: ChangePasswordSectionProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordOtp, setPasswordOtp] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const isTwoFactorEnabled = session?.user?.isTwoFactorEnabled;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, otp: passwordOtp }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === '2FA_REQUIRED') {
          toast.error('2FA code is required');
          return;
        }
        throw new Error(data.error || 'Failed to update password');
      }

      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordOtp('');
      setIsExpanded(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
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
                    <Lock size={18} className="text-gray-300" />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-white">{t.changePasswordTitle || 'Change Password'}</h3>
                    <p className="text-xs text-gray-400">{t.changePasswordDesc || 'Update your password.'}</p>
                </div>
            </div>
            <div className={`p-1 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                <ChevronRight size={18} />
            </div>
        </button>

        {isExpanded && (
            <div className="p-4 pt-2 sm:pl-[68px]">
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Current Password</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                    />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">New Password</label>
                        <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                        minLength={6}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Confirm New Password</label>
                        <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                        minLength={6}
                        />
                    </div>
                    </div>
                    <div className="flex justify-end pt-2 items-center gap-4">
                    {isTwoFactorEnabled && (
                        <input
                        type="text"
                        placeholder="2FA Code"
                        value={passwordOtp}
                        onChange={(e) => setPasswordOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-24 rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white text-center tracking-widest font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        maxLength={6}
                        />
                    )}
                    <Button
                        type="submit"
                        disabled={loading || !currentPassword || !newPassword || (isTwoFactorEnabled && passwordOtp.length !== 6)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-sm rounded-lg"
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                    </div>
                </form>
            </div>
        )}
    </div>
  );
}
