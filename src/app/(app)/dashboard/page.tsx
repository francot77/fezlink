'use client';

import {
  BarChart3,
  Flame,
  Layout,
  Link as LinkIcon,
  Rocket,
  Settings,
  User as UserIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Spinner from '@/components/spinner';
import useLinks from '@/hooks/useLinks';
import LinkManager from '@/features/links/components/LinkManager';
import Stats from '@/components/stats';
import BiopageEditor from './biopageeditor';
import ProfileEditor from '@/features/profile/ProfileEditor';
import ConfigSection from '@/features/config/ConfigSection';
import { PricingSection } from '@/components/PricingSection';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';
import InsightsDashboard from '@/features/insights/InsightsDashboard';
import CustomModal from '@/components/Modalv2';
// import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from 'next-intl';
import { DashboardHeader } from './components/DashboardHeader';
import { SupportedLanguage } from '@/types/i18n';
import { DashboardSidebar, Section } from './components/DashboardSidebar';
import { VerifyEmailWarning } from './components/VerifyEmailWarning';

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
    const storedQuickMenu = localStorage.getItem('quickMenuEnabled');
    if (storedQuickMenu) {
      setQuickMenuEnabled(JSON.parse(storedQuickMenu));
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
      color: '#3b82f6', // blue-500
    },
    {
      id: 'stats',
      label: t('menu.analytics'),
      description: t('menu.analyticsDesc'),
      icon: <BarChart3 size={18} />,
      content: <Stats links={linkState.links} language={language} />,
      color: '#10b981', // emerald-500
    },
    {
      id: 'biopage',
      label: t('menu.biopage'),
      description: t('menu.biopageDesc'),
      icon: <Layout size={18} />,
      content: <BiopageEditor onGoToProfile={() => handleSectionChange('profile')} />,
      color: '#8b5cf6', // violet-500
    },
    {
      id: 'insights',
      label: t('menu.insights'),
      description: t('menu.insightsDesc'),
      icon: <Rocket size={18} />,
      content: <InsightsDashboard />,
      color: '#ec4899', // pink-500
    },
    {
      id: 'profile',
      label: t('menu.profile'),
      description: t('menu.profileDesc'),
      icon: <UserIcon size={18} />,
      content: <ProfileEditor language={language} />,
      color: '#06b6d4', // cyan-500
    },
    {
      id: 'premium',
      label: t('menu.subscription'),
      description: t('menu.subscriptionDesc'),
      icon: <Flame size={18} />,
      content: <PricingSection showManageActions={true} />,
      color: '#f97316', // orange-500
    },
    {
      id: 'config',
      label: t('menu.config') || 'Config', // Fallback if translation missing
      description: t('menu.configDesc') || 'Manage your account settings',
      icon: <Settings size={18} />,
      content: <ConfigSection language={language} setLanguage={setLanguage} translations={{}} />,
      color: '#9ca3af', // gray-400
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

  // Check if user is verified (unless they are in Config or Profile sections, which might be allowed)
  // But request says "ver primero una pantalla", implying blocking.
  // However, usually we allow Config/Profile to change email or logout.
  // Let's block everything except maybe Config/Profile if we wanted to be nice, 
  // but strictly following "ver primero una pantalla" -> Block main view.
  const isVerified = user?.isVerified;

  // Allow access to Profile and Config even if not verified, so they can logout or change email
  const isAllowedSection = ['config', 'profile'].includes(activeSection);
  const showVerificationWarning = !isVerified && !isAllowedSection;

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

        <div className="flex flex-col gap-4">
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
              {showVerificationWarning ? (
                <VerifyEmailWarning />
              ) : (
                currentSection.content
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

