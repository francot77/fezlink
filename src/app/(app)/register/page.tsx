/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import debounce from 'lodash.debounce';
import {
  Mail,
  User,
  Lock,
  Loader2,
  Check,
  X,
  Github,
  Chrome,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [error, setError] = useState<string | string[] | null>(null);
  const [loading, setLoading] = useState(false);

  const renderError = (error: unknown) => {
    if (!error) return;
    if (typeof error === 'string') return error;
    if (typeof error === 'object') {
      return Object.entries(error).map(([field, { errors }]) =>
        errors.map((message: string, i: number) => <div key={`${field}-${i}`}>{message}</div>)
      );
    }
  };
  const checkUsername = debounce(async (value: string) => {
    if (value.length < 3) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      return;
    }
    setCheckingUsername(true);
    try {
      const res = await fetch(`/api/auth/check-username?username=${value}`);
      const data = await res.json();
      setUsernameAvailable(data.available);
    } catch {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  }, 400);

  useEffect(() => {
    if (username.length >= 3) {
      setCheckingUsername(true);
    }
    checkUsername(username);
    return () => checkUsername.cancel();
  }, [username]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data.error);
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      window.location.href = '/login';
    } catch {
      setError('Network error. Please check your connection.');
      setLoading(false);
    }
  }

  const isFormValid = email && username && password && usernameAvailable === true && !loading;

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
        <div
          className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl animate-pulse"
          style={{ animationDuration: '5s', animationDelay: '2s' }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />

          <div className="relative p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 ring-1 ring-white/10">
                <Sparkles size={32} className="text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-emerald-100 to-cyan-100 bg-clip-text text-transparent">
                  Create account
                </h1>
                <p className="text-sm text-gray-400">Join Fezlink and start sharing your links</p>
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
                  <Mail size={16} className="text-emerald-400" />
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
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-11 text-white placeholder-gray-500 backdrop-blur-sm transition focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                </div>
              </div>

              {/* Username Input */}
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="flex items-center gap-2 text-sm font-medium text-gray-300"
                >
                  <User size={16} className="text-cyan-400" />
                  Username
                </label>
                <div className="relative">
                  <input
                    id="username"
                    type="text"
                    placeholder="yourname"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                    }
                    required
                    minLength={3}
                    className={`w-full rounded-xl border px-4 py-3 pl-11 pr-11 text-white placeholder-gray-500 backdrop-blur-sm transition focus:outline-none focus:ring-2 ${
                      username.length >= 3 && usernameAvailable === true
                        ? 'border-emerald-400/50 bg-emerald-500/10 focus:border-emerald-400 focus:ring-emerald-500/20'
                        : username.length >= 3 && usernameAvailable === false
                          ? 'border-red-400/50 bg-red-500/10 focus:border-red-400 focus:ring-red-500/20'
                          : 'border-white/10 bg-white/5 focus:border-cyan-400/50 focus:ring-cyan-500/20'
                    }`}
                  />
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />

                  {/* Status Icon */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {checkingUsername && (
                      <Loader2 size={18} className="animate-spin text-cyan-400" />
                    )}
                    {!checkingUsername && username.length >= 3 && usernameAvailable === true && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/30">
                        <Check size={14} className="text-emerald-400" />
                      </div>
                    )}
                    {!checkingUsername && username.length >= 3 && usernameAvailable === false && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 ring-1 ring-red-500/30">
                        <X size={14} className="text-red-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Username Feedback */}
                {username.length >= 3 && (
                  <div className="flex items-center gap-2 text-xs">
                    {checkingUsername && (
                      <span className="text-gray-400">Checking availability...</span>
                    )}
                    {!checkingUsername && usernameAvailable === true && (
                      <span className="text-emerald-400">✓ Username available</span>
                    )}
                    {!checkingUsername && usernameAvailable === false && (
                      <span className="text-red-400">✗ Username already taken</span>
                    )}
                  </div>
                )}
                {username.length > 0 && username.length < 3 && (
                  <span className="text-xs text-gray-500">Minimum 3 characters</span>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="flex items-center gap-2 text-sm font-medium text-gray-300"
                >
                  <Lock size={16} className="text-purple-400" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-11 text-white placeholder-gray-500 backdrop-blur-sm transition focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                </div>
                {password.length > 0 && password.length < 6 && (
                  <span className="text-xs text-gray-500">Minimum 6 characters</span>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 backdrop-blur-sm space-y-1">
                  {renderError(error)}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid}
                className={`group relative w-full overflow-hidden rounded-xl px-6 py-3 font-semibold text-white transition-all duration-300 ${
                  isFormValid
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 shadow-lg shadow-emerald-500/30 hover:scale-105 hover:shadow-emerald-500/40'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
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
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-emerald-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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
                <span className="absolute -top-2 -right-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 text-xs font-bold text-white shadow-lg">
                  Soon
                </span>
              </button>
              <button
                disabled
                className="group relative flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-400 backdrop-blur-sm transition cursor-not-allowed opacity-60"
              >
                <Github size={18} />
                <span className="hidden sm:inline">GitHub</span>
                <span className="absolute -top-2 -right-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 text-xs font-bold text-white shadow-lg">
                  Soon
                </span>
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-emerald-400 transition hover:text-emerald-300"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="mt-6 text-center text-xs text-gray-500">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-gray-400 hover:text-gray-300 transition">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-gray-400 hover:text-gray-300 transition">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
