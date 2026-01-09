'use client';

import { useTranslations } from 'next-intl';
import { useRef, useEffect } from 'react';

export default function AboutSection() {
  const t = useTranslations('landing.about');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
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

  const paragraphs = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'] as const;

  return (
    <section 
      ref={sectionRef}
      className="relative max-w-4xl mx-auto px-6 py-24 md:py-32 opacity-0 transition-opacity duration-1000"
    >
      <style jsx>{`
        .animate-fade-in {
          animation: fade-in 1.2s ease-out forwards;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .manifesto-text p {
          margin-bottom: 2rem;
          line-height: 1.6;
          font-size: 1.25rem;
          color: #e5e7eb; /* gray-200 */
        }
        .manifesto-text p:last-child {
          font-weight: 700;
          color: #10b981; /* emerald-500 */
          font-size: 1.5rem;
          margin-top: 3rem;
        }
        @media (min-width: 768px) {
          .manifesto-text p {
             font-size: 1.5rem;
             line-height: 1.5;
          }
          .manifesto-text p:last-child {
             font-size: 2rem;
          }
        }
      `}</style>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-emerald-500/50"></div>

      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
          {t('title')}
        </h1>
      </div>

      <div className="manifesto-text font-serif tracking-wide text-gray-300">
        {paragraphs.map((key, index) => (
            <p key={key} style={{ animationDelay: `${index * 150}ms` }}>
              {t(`manifesto.${key}`)}
            </p>
        ))}
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-t from-transparent to-emerald-500/50"></div>
    </section>
  );
}
