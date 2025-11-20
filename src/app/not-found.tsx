"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-16 text-gray-900">
      <div className="max-w-xl rounded-2xl bg-white p-8 shadow-lg shadow-indigo-100">
        <div className="flex items-center gap-3 text-indigo-600">
          <AlertTriangle className="h-7 w-7" aria-hidden />
          <p className="text-sm font-semibold tracking-wide uppercase">404 - Page not found</p>
        </div>

        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Something went wrong</h1>
        <p className="mt-3 text-lg text-gray-600">
          The page you&apos;re looking for doesn&apos;t exist. We&apos;ll take you back home in
          5 seconds.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Go to homepage now
          </Link>
          <p className="text-sm text-gray-500">Redirecting automatically...</p>
        </div>
      </div>
    </main>
  );
}
