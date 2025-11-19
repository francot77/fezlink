'use client'

import NavBar from '@/components/navbar'
import Button from '@/components/button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const highlights = [
  'Track clicks and geographic reach with real-time analytics.',
  'Generate branded QR codes and share them anywhere.',
  'Build a bio page to centralize your social links.',
  'Privacy-first: no ads, no distractions for your visitors.',
]

const featureCards = [
  {
    title: 'Clear analytics',
    description: 'See who is engaging with your links, how often, and from where with digestible charts and metrics.',
    accent: 'from-cyan-400/30 to-blue-500/20',
  },
  {
    title: 'QR-ready links',
    description: 'Create downloadable QR codes for events, print materials, or quick sharing in a couple of clicks.',
    accent: 'from-emerald-400/25 to-green-500/15',
  },
  {
    title: 'Polished bio pages',
    description: 'Launch a simple, on-brand landing page that brings every important link together for your audience.',
    accent: 'from-fuchsia-400/25 to-purple-500/20',
  },
]

const steps = [
  {
    title: 'Create your short link',
    detail: 'Drop in a destination URL and customize the slug to match your brand.',
  },
  {
    title: 'Share anywhere',
    detail: 'Distribute your short link or QR code across social, email, and campaigns.',
  },
  {
    title: 'Watch the numbers grow',
    detail: 'Monitor clicks, devices, and countries with live metrics inside the dashboard.',
  },
]

export default function Home() {
  const router = useRouter()
  const [globalClicks, setGlobalClicks] = useState<number | null>(null)

  useEffect(() => {
    const fetchGlobalClicks = async () => {
      try {
        const response = await fetch('/api/metrics/global')
        if (!response.ok) return
        const data: { count?: number } = await response.json()
        setGlobalClicks(data.count ?? 0)
      } catch (error) {
        console.error('Error fetching global clicks', error)
      }
    }

    fetchGlobalClicks()
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-10 top-16 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-12 right-0 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl" />
      </div>

      <NavBar />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-20 pt-28 md:px-8 lg:px-10">
        <section className="grid items-center gap-12 md:grid-cols-2">
          <div className="space-y-8 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-cyan-200 ring-1 ring-white/10">
              <span className="text-lg">✨</span>
              <p>Link management built to be fast, focused, and clear.</p>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
                Shorten, share, and measure in one place
              </h1>
              <p className="text-lg text-gray-300 md:text-xl">
                Fezlink turns every URL into a smart link with analytics, QR codes, and a customizable bio page—without ads.
              </p>
            </div>

            <ul className="space-y-3 text-left text-base text-gray-200 md:text-lg">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 text-emerald-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-start">
              <Button
                title="Start now"
                customStyles={{
                  backgroundColor: '#10B981',
                  color: '#0B1021',
                  width: '12rem',
                  padding: '0.9rem 1.2rem',
                  borderRadius: '0.75rem',
                  fontWeight: 'bold',
                  letterSpacing: '0.01em',
                  boxShadow: '0 15px 45px rgba(16, 185, 129, 0.35)',
                }}
                onClick={() => router.push('/dashboard')}
              />
              <button
                className="w-full rounded-xl border border-white/20 px-5 py-3 text-base font-medium text-white transition hover:border-white/40 hover:bg-white/5 sm:w-auto"
                onClick={() => router.push('/pricing')}
              >
                View pricing
              </button>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/5 via-white/0 to-cyan-500/10 blur-2xl" />
            <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-300">Live overview</p>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300">Updated</span>
              </div>
              <h2 className="mt-2 text-2xl font-semibold">Campaign snapshot</h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-300">Total clicks</p>
                    <p className="text-2xl font-bold">
                      {globalClicks === null ? '—' : globalClicks.toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-300">+14% this week</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-gray-200">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-gray-400">Top country</p>
                    <p className="text-lg font-semibold">United States</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-gray-400">Device mix</p>
                    <p className="text-lg font-semibold">68% mobile</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                    <Image src="/qr.webp" width={32} height={32} alt="QR preview" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Share instantly</p>
                    <p className="text-lg font-semibold">Downloadable QR ready to use</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-2 text-center">
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">Why Fezlink</p>
            <h2 className="text-3xl font-bold md:text-4xl">Designed for modern sharing</h2>
            <p className="text-gray-300 md:text-lg">Everything you need to shorten, brand, and measure links is already built in.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className={`rounded-2xl border border-white/10 bg-gradient-to-br ${feature.accent} p-5 shadow-lg backdrop-blur`}
              >
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-gray-200">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid items-center gap-10 rounded-3xl border border-white/10 bg-white/5 px-6 py-10 backdrop-blur md:grid-cols-[1.1fr_0.9fr] md:px-10">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-200">How it works</p>
            <h3 className="text-3xl font-semibold">Launch a trackable link in minutes</h3>
            <p className="text-gray-300">
              Fezlink trims busywork out of the process. Create a link, share it, and immediately see how your audience responds—no
              complicated setup required.
            </p>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-lg font-bold text-emerald-300">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{step.title}</p>
                    <p className="text-gray-300">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-indigo-500/10 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-200">Sample bio page</p>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white">Preview</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/20">
                <Image src="/hero.webp" width={128} height={128} alt="Bio avatar" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-lg font-semibold">@yourbrand</p>
                <p className="text-sm text-gray-300">Link everything your audience should see first.</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-white/10 px-4 py-3 text-white">Latest launch: product announcement</div>
              <div className="rounded-xl bg-white/10 px-4 py-3 text-white">Event RSVP and ticketing</div>
              <div className="rounded-xl bg-white/10 px-4 py-3 text-white">Newsletter signup</div>
            </div>
            <button
              className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              onClick={() => router.push('/bio')}
            >
              Try the bio page builder
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
