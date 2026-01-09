import FeaturesSection from '@/components/FeaturesSection';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import NavBar from '@/components/navbar';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('landing.features_extended');
  return {
    title: `FezLink - ${t('title')}`,
    description: t('subtitle'),
  };
}

export default function FeaturesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
      {/* Background blobs reusing styles from landing */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-10 top-16 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl opacity-40 animate-pulse" />
        <div className="absolute right-0 bottom-12 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <NavBar />

      <div className="pt-24 pb-12">
        <FeaturesSection />
      </div>
    </main>
  );
}
