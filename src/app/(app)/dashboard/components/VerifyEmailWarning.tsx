'use client';

import { Mail, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Button from '@/components/button';

export function VerifyEmailWarning() {
  const { data: session, update } = useSession();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [hasSentBefore, setHasSentBefore] = useState(false);

  // Fetch initial status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/verify-email');
        if (res.ok) {
          const data = await res.json();
          setHasSentBefore(data.hasSentBefore);
          if (data.cooldownRemaining > 0) {
            setCooldown(data.cooldownRemaining);
            setSent(true); // Assume sent if cooling down
          }
        }
      } catch (err) {
        console.error('Failed to fetch verification status', err);
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchStatus();
  }, []);

  // Auto-poll status when window gains focus (instead of interval)
  useEffect(() => {
    const onFocus = async () => {
      await update();
      if (session?.user?.isVerified) {
        window.location.reload();
      }
    };

    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [update, session?.user?.isVerified]);

  // Optional: Very slow polling (every 30s) just in case
  useEffect(() => {
    const interval = setInterval(async () => {
      // Silent update
      await update();
      if (session?.user?.isVerified) {
        window.location.reload();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [update, session?.user?.isVerified]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const checkStatus = async () => {
    setChecking(true);
    await update();
    if (session?.user?.isVerified) {
      window.location.reload();
    } else {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    if (!session?.user?.email || cooldown > 0) return;

    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          // Parse "Please wait X seconds" or set default
          // Extract seconds from error message if possible or use default
          setCooldown(60);
          throw new Error(data.error || 'Please wait before resending.');
        }
        throw new Error(data.error || 'Error al enviar el correo');
      }

      setSent(true);
      setHasSentBefore(true);
      setCooldown(60); // Start client-side cooldown
    } catch (err: any) {
      setError(err.message || 'No se pudo enviar el correo.');
    } finally {
      setSending(false);
    }
  };

  if (loadingStatus) {
    return <div className="p-8 text-center text-gray-400">Cargando estado...</div>;
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
      <div className="mb-6 rounded-full bg-blue-500/10 p-6 relative">
        <Mail className="h-16 w-16 text-blue-500" />
        {hasSentBefore && (
          <div className="absolute -right-2 -top-2 rounded-full bg-orange-500 p-2 shadow-lg">
            <span className="block h-3 w-3 animate-ping rounded-full bg-white opacity-75"></span>
          </div>
        )}
      </div>

      <h2 className="mb-3 text-3xl font-bold text-white">Verifica tu correo electrónico</h2>

      <p className="mb-8 max-w-md text-gray-400 text-lg">
        {hasSentBefore ? (
          <>
            Hemos enviado un enlace de confirmación a <span className="text-white font-medium">{session?.user?.email}</span>.
            <br />
            <span className="text-sm mt-2 block">Por favor, haz clic en el enlace para activar tu cuenta.</span>
          </>
        ) : (
          <>
            Para activar tu cuenta, necesitamos verificar tu correo: <span className="text-white font-medium">{session?.user?.email}</span>.
            <br />
            <span className="text-sm mt-2 block">Haz clic en el botón de abajo para recibir el enlace.</span>
          </>
        )}
      </p>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Button
          onClick={checkStatus}
          disabled={checking}
          className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg font-medium shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02]"
        >
          {checking ? 'Comprobando...' : '¡Ya verifiqué mi correo!'}
        </Button>

        <div className="h-px w-full bg-white/10 my-2" />

        {/* Show Send button if not cooling down OR if never sent before */}
        <Button
          onClick={handleResend}
          disabled={sending || cooldown > 0}
          className={`w-full flex items-center justify-center gap-2 border border-white/10 text-gray-300 transition-all
            ${!hasSentBefore
              ? 'bg-blue-600 hover:bg-blue-700 text-white border-transparent'
              : 'bg-white/5 hover:bg-white/10'
            }`}
        >
          {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          {cooldown > 0
            ? `Reenviar en ${cooldown}s`
            : (sending
              ? 'Enviando...'
              : (!hasSentBefore ? 'Enviar correo de verificación' : 'Reenviar correo')
            )
          }
        </Button>

        {sent && hasSentBefore && cooldown > 50 && (
          <div className="rounded-lg bg-green-500/10 p-4 text-green-400 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 size={18} />
            ¡Correo enviado!
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded-lg">{error}</p>
        )}

        <p className="text-xs text-gray-500 mt-2">
          Esta pantalla se actualizará automáticamente cuando verifiques tu cuenta.
        </p>
      </div>
    </div>
  );
}
