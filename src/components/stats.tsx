'use client';
import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Compass, ArrowLeft, LayoutDashboard } from 'lucide-react';
import useLinks, { Link } from '@/hooks/useLinks';
import { SupportedLanguage } from '@/types/i18n';
import Metrics from '@/features/metrics/components/Metrics';
import { useTranslations } from 'next-intl';
import { DashboardOverview } from '@/app/(app)/dashboard/components/DashboardOverview';

interface StatsProps {
  links?: Link[];
  language?: SupportedLanguage;
}


const Stats = ({ links: providedLinks, language = 'en' }: StatsProps) => {
  const linkStore = useLinks({ autoLoad: !providedLinks });
  const links = useMemo(() => providedLinks ?? linkStore.links, [providedLinks, linkStore.links]);
  const [selectedLink, setSelectedLink] = useState<string>('');
  const t = useTranslations('metrics');

  const selected = links.find((link) => link.id === selectedLink);

  if (!selectedLink) {
    return (
      <div className="space-y-6">
         <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20 text-blue-300">
               <LayoutDashboard />
            </div>
            <div>
               <h2 className="text-2xl font-bold text-white">{t('overview.title')}</h2>
               <p className="text-sm text-gray-400">{t('overview.subtitle')}</p>
            </div>
         </div>
         <DashboardOverview links={links} onSelectLink={setSelectedLink} />
         
         {/* Fallback to see list if needed */}
         <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">{t('overview.allLinks')}</h3>
             <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {links.map((link) => (
                <button
                  key={link.id}
                  onClick={() => setSelectedLink(link.id)}
                  className="group relative w-full break-words rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm transition-all hover:border-blue-500/30 hover:bg-white/10 hover:shadow-md hover:shadow-blue-900/10 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-200 transition-colors group-hover:text-blue-200 truncate">
                        {link.slug || link.shortUrl}
                      </div>
                      <div className="text-xs text-gray-500 truncate transition-colors group-hover:text-gray-400">
                        {link.destinationUrl}
                      </div>
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-gray-400 transition-all group-hover:border-blue-500/30 group-hover:bg-blue-500/20 group-hover:text-blue-400">
                      <BarChart3 size={16} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button 
        onClick={() => setSelectedLink('')}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-2"
      >
        <ArrowLeft size={16} />
        {t('overview.backToDashboard')}
      </button>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-700 bg-gray-900/60 p-4 shadow-lg md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20 text-blue-300">
            <BarChart3 />
          </div>
          <div>
            <p className="text-sm text-gray-400">{t('subtitle')}</p>
            <h2 className="text-xl font-semibold text-white">{t('title')}</h2>
          </div>
        </div>
        {selected && (
          <div className="max-w-full overflow-hidden rounded-full bg-gray-800 px-4 py-2 text-sm text-gray-300">
            {t('viewing')}:{' '}
            <span className="inline-block max-w-full truncate align-middle font-semibold text-white md:max-w-2xl">
              {selected.destinationUrl}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-200">{t('selectLink')}</p>
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => setSelectedLink(link.id)}
              className={`w-full break-words rounded-lg border px-3 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectedLink === link.id
                  ? 'border-blue-500 bg-blue-500/20 text-white'
                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
                }`}
            >
              {link.destinationUrl}
            </button>
          ))}
          {links.length === 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-700 bg-gray-800/60 px-4 py-3 text-sm text-gray-400">
              <Compass size={16} /> {t('empty')}
            </div>
          )}
        </div>
      </div>

      {selectedLink && (
        <Metrics linkId={selectedLink} selectedUrl={selected?.destinationUrl} language={language} />
      )}
    </div>
  );
};

export default Stats;
