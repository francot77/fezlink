import { useState, useEffect } from 'react';
import { ShieldCheck, Smartphone, Check, Copy, RefreshCw, ChevronRight } from 'lucide-react';
import Button from '@/components/button';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface TwoFactorSectionProps {
  translations?: Record<string, string>;
}

export function TwoFactorSection({ translations: t = {} }: TwoFactorSectionProps) {
  const { data: session, update } = useSession();
  const [step, setStep] = useState<'initial' | 'setup' | 'enabled'>('initial');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (session?.user?.isTwoFactorEnabled) {
      setStep('enabled');
    }
  }, [session?.user?.isTwoFactorEnabled]);

  const handleStartSetup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/generate', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setStep('setup');
      } else {
        toast.error('Failed to generate 2FA secret');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error generating 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!token || !secret) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, secret }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep('enabled');
        toast.success('Two-Factor Authentication Enabled!');
        await update(); // Update session to reflect new 2FA status
        setIsExpanded(false);
      } else {
        toast.error(data.error || 'Invalid code');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error verifying code');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      toast.success('Secret copied to clipboard');
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
            <ShieldCheck size={18} className="text-gray-300" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">{t.twoFactorTitle || 'Two-Factor Authentication'}</h3>
            <p className="text-xs text-gray-400">{step === 'enabled' ? 'Enabled' : 'Disabled'}</p>
          </div>
        </div>
        <div className={`p-1 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
          <ChevronRight size={18} />
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 pt-2 sm:pl-[68px]">
          <div className="space-y-6">
            {step === 'initial' && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-blue-100">Protect your account</h3>
                    <p className="text-xs text-blue-200/70 leading-relaxed">
                      Secure your account with TOTP (Time-based One-Time Password) using apps like Google Authenticator or Authy.
                    </p>
                  </div>
                  <Button
                    onClick={handleStartSetup}
                    disabled={loading}
                    className="w-fit rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500"
                  >
                    {loading ? <RefreshCw className="animate-spin h-4 w-4" /> : 'Enable 2FA'}
                  </Button>
                </div>
              </div>
            )}

            {step === 'setup' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex flex-col items-center justify-center space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    {qrCode && (
                      <div className="bg-white p-2 rounded-lg">
                        <img src={qrCode} alt="2FA QR Code" className="w-32 h-32" />
                      </div>
                    )}
                    <p className="text-xs text-gray-400 text-center max-w-[200px]">
                      Scan this QR code with your authenticator app
                    </p>
                  </div>

                  <div className="flex flex-col justify-center space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400">Or enter code manually</label>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/10 font-mono text-xs text-gray-300">
                        <span className="flex-1 truncate">{secret}</span>
                        <button onClick={copyToClipboard} className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white">
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400">Verify Code</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={token}
                          onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-center font-mono text-base tracking-widest focus:ring-1 focus:ring-blue-500/50 outline-none text-white"
                        />
                        <Button
                          onClick={handleVerify}
                          disabled={loading || token.length !== 6}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-lg disabled:opacity-50 text-sm"
                        >
                          {loading ? <RefreshCw className="animate-spin h-4 w-4" /> : 'Verify'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setStep('initial')} className="w-full text-xs text-gray-400 hover:text-white h-8">
                  Cancel
                </Button>
              </div>
            )}

            {step === 'enabled' && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 animate-in zoom-in-95">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Check className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-green-100">2FA is Enabled</h3>
                    <p className="text-xs text-green-200/70">
                      Your account is secured. You will need to enter a code when logging in from a new device.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
