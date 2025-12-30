'use client'

import NavBar from '@/components/navbar'
import Button from '@/components/button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { useTranslations } from 'next-intl'

export default function Home() {
  const router = useRouter()
  const t = useTranslations('landing')

  const [globalClicks, setGlobalClicks] = useState<number | null>(null)
  const [animatedCount, setAnimatedCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLElement>(null)
  const stepsRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const fetchGlobalClicks = async () => {
      try {
        const response = await fetch('/api/public/global')
        if (!response.ok) return
        const data: { count?: number } = await response.json()
        setGlobalClicks(data.count ?? 0)
      } catch {
        // silent fail — metrics should never block UX
      }
    }

    fetchGlobalClicks()

    // Trigger entrance animations
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  // Animated counter
  useEffect(() => {
    if (globalClicks === null) return

    const duration = 2000
    const steps = 60
    const increment = globalClicks / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= globalClicks) {
        setAnimatedCount(globalClicks)
        clearInterval(timer)
      } else {
        setAnimatedCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [globalClicks])

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up')
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll('.observe-scroll')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out forwards;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out forwards;
        }
        
        .floating {
          animation: float 6s ease-in-out infinite;
        }
        
        .pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }
        
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 60px rgba(16, 185, 129, 0.3);
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-4px) scale(1.02);
        }
        
        .gradient-border {
          position: relative;
          background: linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1));
          border-radius: 1rem;
        }
        
        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 1rem;
          padding: 2px;
          background: linear-gradient(135deg, #10B981, #06B6D4, #8B5CF6);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.5;
          transition: opacity 0.3s;
        }
        
        .gradient-border:hover::before {
          opacity: 1;
        }
      `}</style>

      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-10 top-16 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl pulse-glow" />
        <div className="absolute bottom-12 right-0 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <NavBar />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-20 px-4 pb-20 pt-28 md:px-8 lg:px-10">
        {/* HERO */}
        <section ref={heroRef} className="grid items-center gap-12 md:grid-cols-2">
          <div className={`space-y-8 text-center md:text-left ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-emerald-200 ring-1 ring-white/10 hover:bg-white/10 hover:ring-emerald-400/30 transition-all duration-300">
              <span className="text-lg animate-pulse">⚡</span>
              <p>{t('hero.badge')}</p>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl bg-gradient-to-r from-white via-emerald-100 to-cyan-100 bg-clip-text text-transparent">
                {t('hero.title.line1')}
                <br />
                {t('hero.title.line2')}
                <br />
                {t('hero.title.line3')}
              </h1>
              <p className="text-lg text-gray-300 md:text-xl">
                {t('hero.subtitle')}
              </p>
            </div>

            <ul className="space-y-3 text-left text-base text-gray-200 md:text-lg">
              {[0, 1, 2, 3].map((index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 transition-all duration-300 hover:translate-x-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="mt-1 text-emerald-400 text-xl">•</span>
                  <span>{t(`hero.highlights.${index}`)}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-start">
              <div className="hover-lift">
                <Button
                  title={t('hero.cta.primary')}
                  customStyles={{
                    backgroundColor: '#10B981',
                    color: '#0B1021',
                    width: '14rem',
                    padding: '0.9rem 1.2rem',
                    borderRadius: '0.75rem',
                    fontWeight: 'bold',
                    boxShadow: '0 15px 45px rgba(16, 185, 129, 0.35)',
                  }}
                  onClick={() => router.push('/bio')}
                />
              </div>
              <button
                className="group w-full rounded-xl border border-white/20 px-5 py-3 text-base font-medium text-white transition-all duration-300 hover:border-emerald-400/50 hover:bg-white/5 hover:shadow-lg hover:shadow-emerald-500/20 sm:w-auto"
                onClick={() => router.push('/dashboard')}
              >
                <span className="group-hover:text-emerald-300 transition-colors">{t('hero.cta.secondary')}</span>
              </button>
            </div>
          </div>

          {/* PREVIEW */}
          <div className={`relative flex justify-center ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/5 via-white/0 to-cyan-500/10 blur-2xl" />
            <div className="relative w-full max-w-md floating">
              <div className="glass-card rounded-3xl p-6 shadow-2xl">
                <p className="text-sm text-gray-300">{t('stats.subtitle')}</p>
                <h2 className="mt-2 text-2xl font-semibold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                  {t('stats.title')}
                </h2>

                <div className="mt-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 px-4 py-4 border border-white/10 hover:border-emerald-400/30 transition-all duration-300">
                  <p className="text-sm text-gray-400">{t('stats.totalClicks')}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    {globalClicks === null ? '—' : animatedCount.toLocaleString()}
                  </p>
                  <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-1000" style={{ width: globalClicks ? '100%' : '0%' }} />
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-400 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {t('stats.realData')}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section ref={featuresRef} className="space-y-8 observe-scroll opacity-0">
          <div className="text-center space-y-2">
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-200">
              {t('features.sectionTitle')}
            </p>
            <h2 className="text-3xl font-bold md:text-4xl bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
              {t('features.sectionSubtitle')}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: '🎨', accent: 'from-emerald-400/25 to-green-500/15' },
              { icon: '📊', accent: 'from-cyan-400/30 to-blue-500/20' },
              { icon: '📱', accent: 'from-fuchsia-400/25 to-purple-500/20' }
            ].map((feature, index) => (
              <div
                key={index}
                className={`glass-card rounded-2xl bg-gradient-to-br ${feature.accent} p-6 shadow-lg`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="text-4xl mb-3 transition-transform duration-300 hover:scale-110 inline-block">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold">{t(`features.cards.${index}.title`)}</h3>
                <p className="mt-2 text-gray-200">{t(`features.cards.${index}.description`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section ref={stepsRef} className="observe-scroll opacity-0 grid gap-10 rounded-3xl glass-card px-6 py-12 md:grid-cols-2 md:px-10">
          <div className="space-y-6">
            <h3 className="text-3xl font-semibold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
              {t('howItWorks.title')}
            </h3>
            <p className="text-gray-300">
              {t('howItWorks.subtitle')}
            </p>

            <div className="space-y-4">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="gradient-border flex gap-4 rounded-2xl glass-card p-4 group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 text-lg font-bold text-emerald-300 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-lg font-semibold group-hover:text-emerald-300 transition-colors">
                      {t(`howItWorks.steps.${index}.title`)}
                    </p>
                    <p className="text-gray-300">{t(`howItWorks.steps.${index}.detail`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BIO PREVIEW */}
          <div className="space-y-4">
            <p className="text-sm text-gray-400">{t('bioPreview.label')}</p>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/30 pointer-events-none" />
              <div className="relative p-6 space-y-6">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-emerald-400 shadow-xl" style={{ boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)' }}>
                    <Image src="/hero.webp" width={96} height={96} alt="Creator avatar" className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold tracking-tight">{t('bioPreview.username')}</h3>
                    <p className="text-xs text-white/80">{t('bioPreview.bio')}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h4 className="text-sm font-semibold">{t('bioPreview.linksTitle')}</h4>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/70">
                      {t('bioPreview.linksCount')}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {[0, 1, 2].map((index) => (
                      <li key={index} className="flex items-center gap-2 rounded-xl bg-black/40 border border-white/10 p-2.5">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-emerald-400">
                            {t(`bioPreview.links.${index}.title`)}
                          </p>
                          <p className="text-xs text-white/60">{t(`bioPreview.links.${index}.url`)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}