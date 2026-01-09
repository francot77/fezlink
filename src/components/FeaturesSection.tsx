'use client';

import { useTranslations } from 'next-intl';
import {
  Award, BarChart2, Briefcase,
  Layout, Lock, RefreshCw,
  ShieldCheck, Smile, Zap
} from 'lucide-react';
import Button from '@/components/button';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function FeaturesSection() {
  const t = useTranslations('landing.features_extended');
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            entry.target.classList.remove('opacity-0');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const categories = [
    {
      key: 'technical',
      icon: Zap,
      items: [
        { icon: Zap, key: 'items.0' },
        { icon: BarChart2, key: 'items.1' },
        { icon: Layout, key: 'items.2' },
      ]
    },
    {
      key: 'emotional',
      icon: Smile,
      items: [
        { icon: Smile, key: 'items.0' },
        { icon: ShieldCheck, key: 'items.1' },
        { icon: Briefcase, key: 'items.2' },
      ]
    },
    {
      key: 'unique',
      icon: Award,
      items: [
        { icon: Lock, key: 'items.0' },
        { icon: ShieldCheck, key: 'items.1' },
        { icon: RefreshCw, key: 'items.2' },
      ]
    }
  ];

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative py-20 px-4 md:px-8 max-w-7xl mx-auto opacity-0 transition-opacity duration-700"
    >
      <style jsx>{`
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
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
      `}</style>

      {/* Header */}
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-400 border border-emerald-500/20 mb-4">
          <Award size={16} />
          <span>{t('badge')}</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-emerald-100 to-cyan-100 bg-clip-text text-transparent pb-2">
          {t('title')}
        </h2>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {categories.map((cat) => (
          <div key={cat.key} className="glass-card rounded-3xl p-8 flex flex-col h-full">
            <div className="mb-6 inline-flex p-3 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 w-fit">
              <cat.icon className="w-8 h-8 text-emerald-400" />
            </div>

            <h3 className="text-2xl font-bold mb-6 text-white">{t(`categories.${cat.key}.title`)}</h3>

            <ul className="space-y-6 flex-1">
              {cat.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex gap-4">
                  <div className="mt-1">
                    <div className="p-1.5 rounded-full bg-emerald-500/10">
                      <item.icon size={16} className="text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      {t(`categories.${cat.key}.${item.key}.title`)}
                    </h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {t(`categories.${cat.key}.${item.key}.description`)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Scarcity / CTA Block */}
      <div className="glass-card rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>

        <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
          {t('scarcity')}
        </h3>

        <div className="flex justify-center">
          <Button
            title={t('cta')}
            customStyles={{
              backgroundColor: '#10B981',
              color: '#0B1021',
              padding: '1rem 2rem',
              borderRadius: '0.75rem',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: '0 15px 45px rgba(16, 185, 129, 0.35)',
            }}
            onClick={() => router.push('/register')}
          />
        </div>
      </div>
    </section>
  );
}
