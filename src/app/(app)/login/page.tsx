'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Mail, Lock, Loader2, Github, Chrome, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('>>> [Login] Submitting signIn request. Requires2FA:', requires2FA);
      const result = await signIn('credentials', {
        email,
        password,
        otp: requires2FA ? otp : undefined,
        redirect: false,
      });

      console.log('>>> [Login] SignIn result:', result);

      if (result?.error) {
        if (result.error === '2FA_REQUIRED') {
          setRequires2FA(true);
          setLoading(false);
          return; // Stop here and wait for user to enter OTP
        }
        
        if (result.error === 'INVALID_2FA') {
          setError('Invalid 2FA code. Please try again.');
        } else {
          setError('Invalid email or password. Please try again.');
        }
        setLoading(false);
      } else if (result?.ok) {
        window.location.href = '/dashboard';
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const isFormValid = (email && password && !loading) && (!requires2FA || otp.length === 6);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-950 via-black to-gray-900">
      {/* Animated background blobs */}
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl animate-pulse"
          style={{ animationDuration: '4s' }}
        />
        <div
          className="absolute right-1/4 bottom-20 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse"
          style={{ animationDuration: '6s', animationDelay: '1s' }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl animate-pulse"
          style={{ animationDuration: '5s', animationDelay: '2s' }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />

          <div className="relative p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 ring-1 ring-white/10">
                <LogIn size={32} className="text-cyan-400" />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-100 to-purple-100 bg-clip-text text-transparent">
                  Welcome back
                </h1>
                <p className="text-sm text-gray-400">Sign in to your Fezlink account</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="flex items-center gap-2 text-sm font-medium text-gray-300"
                >
                  <Mail size={16} className="text-cyan-400" />
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-11 text-white placeholder-gray-500 backdrop-blur-sm transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  />
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="flex items-center gap-2 text-sm font-medium text-gray-300"
                  >
                    <Lock size={16} className="text-purple-400" />
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-cyan-400 transition hover:text-cyan-300"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-11 text-white placeholder-gray-500 backdrop-blur-sm transition focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                </div>
              </div>

              {/* 2FA Input */}
              {requires2FA && (
                 <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                  <label
                    htmlFor="otp"
                    className="flex items-center gap-2 text-sm font-medium text-cyan-300"
                  >
                    <ShieldCheck size={16} className="text-cyan-400" />
                    Two-Factor Authentication Code
                  </label>
                  <div className="relative">
                    <input
                      id="otp"
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      autoComplete="one-time-code"
                      autoFocus
                      className="w-full rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 pl-11 text-white placeholder-gray-500 backdrop-blur-sm transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 tracking-widest font-mono text-lg"
                    />
                    <ShieldCheck
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500"
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 backdrop-blur-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid}
                className={`group relative w-full overflow-hidden rounded-xl px-6 py-3 font-semibold text-white transition-all duration-300 ${
                  isFormValid
                    ? 'bg-gradient-to-r from-cyan-600 to-purple-600 shadow-lg shadow-cyan-500/30 hover:scale-105 hover:shadow-cyan-500/40'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight
                        size={20}
                        className={
                          isFormValid ? 'transition-transform group-hover:translate-x-1' : ''
                        }
                      />
                    </>
                  )}
                </span>
                {isFormValid && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-gradient-to-br from-gray-900 to-black px-4 text-gray-500">
                  or continue with
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled
                className="group relative flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-400 backdrop-blur-sm transition cursor-not-allowed opacity-60"
              >
                <Chrome size={18} />
                <span className="hidden sm:inline">Google</span>
                <span className="absolute -top-2 -right-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 px-2 py-0.5 text-xs font-bold text-white shadow-lg">
                  Soon
                </span>
              </button>
              <button
                disabled
                className="group relative flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-400 backdrop-blur-sm transition cursor-not-allowed opacity-60"
              >
                <Github size={18} />
                <span className="hidden sm:inline">GitHub</span>
                <span className="absolute -top-2 -right-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 px-2 py-0.5 text-xs font-bold text-white shadow-lg">
                  Soon
                </span>
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center text-sm text-gray-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-cyan-400 transition hover:text-cyan-300"
              >
                Create one
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="mt-6 text-center text-xs text-gray-500">
          Protected by industry-standard encryption.{' '}
          <Link href="/security" className="text-gray-400 hover:text-gray-300 transition">
            Learn more
          </Link>
        </p>
      </div>
    </div>
  );
}
