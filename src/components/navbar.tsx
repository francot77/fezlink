'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Menu, X, LogIn, UserPlus, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';

type NavElement = {
  title: string;
  path: string;
};

const NavBar = () => {
  const t = useTranslations('navbar');
  const tModal = useTranslations('logoutModal');

  const Routes: NavElement[] = [
    { title: t('home'), path: '/' },
    { title: t('pricing'), path: '/pricing' },
    { title: t('features'), path: '/features' },
    { title: t('about'), path: '/about' },
  ];

  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSignOutModal) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setShowSignOutModal(false);
      }
    };
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button');
    focusable?.[0]?.focus();
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [showSignOutModal]);

  const { user } = useAuth();

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 md:px-8 lg:px-12">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-base font-bold text-white transition-all hover:opacity-90"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-700 to-green-200 text-sm font-bold shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105">
              FL
            </span>
            <span className="hidden bg-gradient-to-r from-green-700 to-green-200 bg-clip-text text-transparent sm:inline">
              Fezlink
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {Routes.map((ne) => (
              <Link
                className="group relative rounded-lg px-4 py-2.5 text-sm font-medium text-gray-300 transition-all duration-200 hover:text-white"
                key={ne.path}
                href={ne.path}
              >
                {ne.title}
                <span className="absolute inset-x-2 bottom-1 h-0.5 scale-x-0 rounded-full bg-gradient-to-r from-green-700 to-green-200 transition-transform duration-200 group-hover:scale-x-100" />
              </Link>
            ))}
          </div>

          {/* Auth Buttons - Desktop */}
          {user ? (
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-700 to-green-200 px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 hover:brightness-110"
            >
              <User className="h-4 w-4 transition-transform group-hover:scale-110" />
              Dashboard
            </Link>
          ) : (
            <div className="hidden items-center gap-3 lg:flex">
              <Link
                href="/login"
                className="group flex items-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:border-white/20 hover:bg-white/5"
              >
                <LogIn className="h-4 w-4 transition-transform group-hover:-rotate-12" />
                Login
              </Link>
              <Link
                href="/register"
                className="group flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-700 to-green-200 px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 hover:brightness-110"
              >
                <UserPlus className="h-4 w-4 transition-transform group-hover:scale-110" />
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center rounded-lg p-2 text-gray-300 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-black/95 backdrop-blur-xl lg:hidden">
            <div className="mx-auto max-w-7xl space-y-1 px-4 py-4">
              {Routes.map((ne) => (
                <Link
                  className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                  key={ne.path}
                  href={ne.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {ne.title}
                </Link>
              ))}
              <div className="space-y-2 border-t border-white/10 pt-4">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Sign Out Modal */}
      {showSignOutModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          role="presentation"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="signout-heading"
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-gradient-to-b from-gray-900 to-black p-6 text-white shadow-2xl"
            tabIndex={-1}
          >
            <p id="signout-heading" className="text-center text-lg font-bold">
              {tModal('title')}
            </p>
            <p className="mt-3 text-center text-sm text-gray-400">
              {tModal('description')}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/5"
              >
                {tModal('cancel')}
              </button>
              <button
                onClick={() => {
                  setShowSignOutModal(false);
                  // Aquí iría tu lógica de sign out
                }}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-red-700"
              >
                {tModal('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
