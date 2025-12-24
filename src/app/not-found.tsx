"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [counter, setCounter] = useState(5);

  useEffect(() => {
    const countdown = setInterval(() => {
      setCounter((prev) => {
        if (prev <= 1) {
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-black to-gray-900 px-6 py-16 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-16 top-24 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute right-10 bottom-12 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-3 text-emerald-200">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
            <AlertTriangle className="h-6 w-6" aria-hidden />
          </span>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">404 - Not Found</p>
        </div>

        <div className="mt-6 space-y-4">
          <h1 className="text-3xl font-bold sm:text-4xl">We couldn&apos;t find that page</h1>
          <p className="text-lg text-gray-200 sm:text-xl">
            Something went wrong. You&apos;ll be redirected to the homepage in {counter} seconds, or you can head back now.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-emerald-300/30 bg-emerald-500/20 px-6 py-3 text-sm font-semibold text-emerald-50 transition hover:border-emerald-300/60 hover:bg-emerald-500/30 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
          >
            Return home now
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-gray-300">
            <span className="text-xs uppercase tracking-[0.2em] text-gray-400">Redirecting in</span>
            <span className="text-lg font-semibold text-emerald-200" aria-live="polite">
              {counter}
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-gray-400">seconds</span>
          </div>
        </div>
      </div>
    </main>
  );
}
