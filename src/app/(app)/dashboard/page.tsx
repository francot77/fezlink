'use client';

import {
  BarChart3,
  Flame,
  Layout,
  Link as LinkIcon,
  Rocket,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Spinner from '@/components/spinner';
import useLinks from '@/hooks/useLinks';
import LinkManager from '@/features/links/components/LinkManager';
import Stats from '@/components/stats';
import BiopageEditor from './biopageeditor';
import PremiumFeatures from '@/components/premiumfeatures';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';
import InsightsDashboard from '@/features/insights/InsightsDashboard';
import CustomModal from '@/components/Modalv2';
// import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from 'next-intl';
import { DashboardHeader } from './components/DashboardHeader';
import { SupportedLanguage } from '@/types/i18n';
import { DashboardSidebar, Section } from './components/DashboardSidebar';

import { useDashboard } from './hooks/useDashboard';

const DashboardPage: React.FC = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const { isLoaded } = useAuth();
  const linkState = useLinks();
  // const { language, setLanguage } = useLanguage();
  const [language, setLanguage] = useState<SupportedLanguage>('es'); // Temporal fallback until context is restored or found
  const [quickMenuEnabled, setQuickMenuEnabled] = useState(false);
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');

  useEffect(() => {
    const stored = localStorage.getItem('quickMenuEnabled');
    if (stored) {
      setQuickMenuEnabled(JSON.parse(stored));
    }
  }, []);

  const handleQuickMenuChange = (enabled: boolean) => {
    setQuickMenuEnabled(enabled);
    localStorage.setItem('quickMenuEnabled', JSON.stringify(enabled));
  };

  const {
    activeSection,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    modalLogout,
    setModalLogout,
    isTransitioning,
    contentRef,
    mainRef,
    handleSectionChange,
    handleLogout,
  } = useDashboard();

  const sections: Section[] = [
    {
      id: 'links',
      label: t('menu.links'),
      description: t('menu.linksDesc'),
      icon: <LinkIcon size={18} />,
      content: <LinkManager linkState={linkState} language={language} />,
    },
    {
      id: 'stats',
      label: t('menu.analytics'),
      description: t('menu.analyticsDesc'),
      icon: <BarChart3 size={18} />,
      content: <Stats links={linkState.links} language={language} />,
    },
    {
      id: 'biopage',
      label: t('menu.biopage'),
      description: t('menu.biopageDesc'),
      icon: <Layout size={18} />,
      content: <BiopageEditor />,
    },
    {
      id: 'insights',
      label: t('menu.insights'),
      description: t('menu.insightsDesc'),
      icon: <Rocket size={18} />,
      content: <InsightsDashboard />,
    },
    {
      id: 'premium',
      label: t('menu.subscription'),
      description: t('menu.subscriptionDesc'),
      icon: <Flame size={18} color="#ff5900" />,
      content: (
        <div className="flex flex-wrap justify-center gap-4">
          <PremiumFeatures
            language={language}
            time={'mensual'}
            priceId={'pri_01jwryd6rgxfdh50rknhcqh1aq'}
          />
          <PremiumFeatures
            language={language}
            time={'anual'}
            priceId={'pri_01jwryfkyzp3jrbj7xw8hjp585'}
          />
        </div>
      ),
    },
  ];

  const currentSection = sections.find((s) => s.id === activeSection) ?? sections[0];

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-gray-900">
        <span className="text-lg text-white">{t('loading')}</span>
        <Spinner color="white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-gray-900 via-[#0b1224] to-black px-2 pb-16 text-white">
      {modalLogout && (
        <CustomModal
          title={t('logoutConfirmTitle')}
          onClose={() => setModalLogout(false)}
          onAccept={handleLogout}
          variant="danger"
        >
          {t('logoutConfirmMessage')}
        </CustomModal>
      )}

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:gap-6 pt-4 sm:pt-10">
        <DashboardHeader
          userName={user?.name}
          language={language}
          setLanguage={setLanguage}
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          quickMenuEnabled={quickMenuEnabled}
          sections={sections}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          translations={{
            welcome: t('welcome'),
            dashboardTitle: t('title'),
            description: t('description'),
            language: t('language'),
            home: tCommon('home'),
            menu: tCommon('menu'),
            close: tCommon('close'),
          }}
        />

        <div className="grid items-start gap-4 md:grid-cols-[minmax(0,260px),1fr] lg:grid-cols-[minmax(0,280px),1fr]">
          <DashboardSidebar
            sections={sections}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            isMobileSidebarOpen={isMobileSidebarOpen}
            setIsMobileSidebarOpen={setIsMobileSidebarOpen}
            quickMenuEnabled={quickMenuEnabled}
            onQuickMenuChange={handleQuickMenuChange}
            onLogout={() => setModalLogout(true)}
            translations={{
              menu: tCommon('menu'),
              close: tCommon('close'),
              logout: t('logout'),
            }}
          />

          {/* Main content */}
          <main
            ref={mainRef}
            className="min-w-0 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/70 via-black/70 to-gray-900/70 backdrop-blur-xl p-4 sm:p-6 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500"
            style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}
          >
            <div
              ref={contentRef}
              className={`min-h-[60vh] transition-all duration-300 ${isTransitioning
                ? 'opacity-0 scale-95'
                : 'opacity-100 scale-100 animate-in fade-in slide-in-from-bottom-4 duration-500'
                }`}
            >
              {currentSection.content}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

