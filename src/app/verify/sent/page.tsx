'use client';

import { Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function VerifySentContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-950 via-black to-gray-900">
      {/* Animated background blobs */}
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl animate-pulse"
          style={{ animationDuration: '4s' }}
        />
        <div
          className="absolute right-1/4 bottom-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl animate-pulse"
          style={{ animationDuration: '6s', animationDelay: '1s' }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl shadow-2xl p-8 text-center space-y-6">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />
          
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <Mail size={40} className="text-emerald-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Verifica tu correo</h1>
            <p className="text-gray-400">
              Hemos enviado un enlace de verificación a:
            </p>
            {email && (
              <p className="text-lg font-medium text-emerald-400">{email}</p>
            )}
            <p className="text-sm text-gray-500 mt-4">
              Haz clic en el enlace del correo para activar tu cuenta y comenzar a usar la plataforma.
            </p>
          </div>

          <div className="pt-4 space-y-4">
            <Link
              href="/login"
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-3 font-semibold text-white transition-all hover:bg-white/10 border border-white/10"
            >
              Volver al inicio de sesión
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifySentPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <VerifySentContent />
    </Suspense>
  );
}
