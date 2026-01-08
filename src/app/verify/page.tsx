'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token no proporcionado.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Error al verificar el email');
        }

        setStatus('success');
        setMessage('¡Tu correo ha sido verificado correctamente! Redirigiendo al Dashboard...');

        // Redirect to dashboard directly as requested
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);

      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'El enlace de verificación es inválido o ha expirado.');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
        {status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verificando tu cuenta...</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Por favor espera un momento.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">¡Verificación Exitosa!</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{message}</p>
            <div className="mt-6">
              <Link
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Ir a Iniciar Sesión
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Error de Verificación</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{message}</p>
            <div className="mt-6">
              <Link
                href="/login"
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
