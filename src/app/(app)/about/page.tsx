import AboutSection from '@/components/AboutSection';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import NavBar from '@/components/navbar';
import SessionWrapper from '@/components/SessionWrapper';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('landing.about');
  return {
    title: t('title'),
    description: "FezLink manifesto. Why we built this for creators.",
  };
}

export default function AboutPage() {
  return (
    <SessionWrapper>
      <main className="relative min-h-screen bg-black text-white selection:bg-emerald-500/30">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]" />
        </div>

        <NavBar />
        
        <div className="relative z-10 pt-20">
          <AboutSection />
        </div>
      </main>
    </SessionWrapper>
  );
}
