'use client';
import React, { useState } from 'react';
import { Globe, TrendingUp } from 'lucide-react';
import { SupportedLanguage } from '@/types/i18n';
import MetricsChart from './MetricsChart';
import { MetricsFilters } from './MetricsFilters';
import { MetricCard } from './MetricCard';
import { useMetricsData } from '../hooks/useMetricsData';
import { MetricsFilters as FiltersType } from '../types/metrics';
import {
  getDeviceIcon,
  getSourceIcon,
  formatDeviceLabel,
  formatSourceLabel,
} from '../utils/metricsHelpers';
import { useTranslations } from 'next-intl';
import { COUNTRY_NAMES } from '@/lib/countryNames';
import { useAuth } from '@/hooks/useAuth';

interface MetricsProps {
  linkId: string;
  selectedUrl?: string;
  language?: SupportedLanguage;
}

// Mapeo de códigos de país a emojis de banderas
const getCountryFlag = (countryCode: string): string => {
  // Convertir código de país a emoji de bandera
  // Los emojis de banderas se forman con los códigos regionales
  if (countryCode === 'UNKNOWN') return '🌍';

  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// Obtener nombre del país
const getCountryName = (countryCode: string): string => {
  return COUNTRY_NAMES[countryCode] || countryCode;
};

export default function Metrics({ linkId, selectedUrl, language = 'en' }: MetricsProps) {
  const t = useTranslations('metrics');
  const { user } = useAuth();
  const isPremium = user?.accountType === 'starter' || user?.accountType === 'pro';

  // Estado de filtros
  const [filters, setFilters] = useState<FiltersType>({
    startDate: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    country: '',
    deviceType: '',
    source: '',
    activePreset: 'week',
    selectedMonth: '',
    selectedYear: '',
  });

  // Fetch data con el custom hook
  const { data, loading, error } = useMetricsData({
    linkId,
    startDate: filters.startDate,
    endDate: filters.endDate,
    country: filters.country,
    deviceType: filters.deviceType,
    source: filters.source,
    language,
  });

  const handleFiltersChange = (newFilters: Partial<FiltersType>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    const end = new Date();
    const start = new Date(end.getTime() - 6 * 24 * 3600 * 1000);
    setFilters({
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      country: '',
      deviceType: '',
      source: '',
      activePreset: 'week',
      selectedMonth: '',
      selectedYear: '',
    });
  };

  const hasActiveFilters = filters.country || filters.deviceType || filters.source;

  // Ordenar países por clicks (descendente)
  const sortedCountries = [...data.availableCountries].sort((a, b) => {
    const clicksA = data.countryTotals[a] || 0;
    const clicksB = data.countryTotals[b] || 0;
    return clicksB - clicksA;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Más compacto en mobile */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />
        <div className="relative p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1 sm:space-y-2">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{t('title')}</h2>
              {selectedUrl && (
                <p className="text-xs sm:text-sm text-gray-400 break-all">
                  <span className="text-gray-500">{t('viewing')}: </span>
                  <span className="font-medium text-emerald-400">{selectedUrl}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 px-4 sm:px-6 py-2 sm:py-3 ring-1 ring-white/10 transition-transform duration-300 hover:scale-105">
                <p className="text-xs font-medium uppercase tracking-wider text-emerald-200">
                  {t('total')}
                </p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  {data.totalClicks.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <MetricsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={clearFilters}
        availableCountries={data.availableCountries}
        availableSources={data.availableSources}
        availableDevices={data.availableDevices}
        maxDateRange={isPremium ? undefined : 7}
        translations={{
          filters: t('filters'),
          clearFilters: t('clearFilters'),
          from: t('from'),
          to: t('to'),
          quickRanges: t('quickRanges'),
          lastWeek: t('lastWeek'),
          lastMonth: t('lastMonth'),
          lastYear: t('lastYear'),
          specificMonth: t('specificMonth'),
          specificYear: t('specificYear'),
          country: t('country'),
          all: t('all'),
          source: t('source'),
          allSources: t('allSources'),
          deviceType: t('deviceType'),
          allDevices: t('allDevices'),
        }}
        tFn={t}
        language={language}
      />

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center gap-3 rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 to-black/60 px-6 py-12 backdrop-blur-xl animate-pulse">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <span className="text-gray-300">{t('loading')}</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-xl sm:rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-4 text-red-400 animate-in fade-in slide-in-from-top-2 duration-300">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && data.stats.length === 0 && (
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-dashed border-white/10 bg-gradient-to-br from-gray-900/40 to-black/40 backdrop-blur-xl p-8 sm:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />
          <div className="relative text-center space-y-3">
            <Globe size={48} className="mx-auto text-gray-600" />
            <p className="text-base sm:text-lg text-gray-400">{t('noData')}</p>
            {hasActiveFilters && (
              <p className="text-sm text-gray-500">
                {t('noDataHint')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Chart */}
      {!loading && !error && data.stats.length > 0 && (
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />
          <div className="relative p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-emerald-400" />
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white">
                {t('clickTrend')}
              </h3>
            </div>
            <MetricsChart stats={data.stats} />
          </div>
        </div>
      )}

      {/* Device Metrics */}
      {data.deviceTotals.length > 0 && (
        <div
          className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}
        >
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white flex items-center gap-2">
            📱 {t('deviceMetrics')}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.deviceTotals.map((device, index) => {
              const trend = data.deviceTrends.find((entry) => entry.key === device.deviceType);
              return (
                <div
                  key={device.deviceType}
                  className="animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                >
                  <MetricCard
                    icon={getDeviceIcon(device.deviceType)}
                    label={formatDeviceLabel(device.deviceType, t)}
                    subtitle={t('deviceType')}
                    value={device.clicks}
                    trend={trend}
                    accentColor="cyan"
                    trendLabels={{ trendNew: t('trendNew'), trendNoData: t('trendNoData') }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Source Metrics */}
      {data.sourceTotals.length > 0 && (
        <div
          className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}
        >
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white flex items-center gap-2">
            🌐 {t('sourceMetrics')}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.sourceTotals.map((entry, index) => {
              const trend = data.sourceTrends.find((item) => item.key === entry.source);
              return (
                <div
                  key={entry.source}
                  className="animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                >
                  <MetricCard
                    icon={getSourceIcon(entry.source)}
                    label={formatSourceLabel(entry.source, t)}
                    subtitle={t('source')}
                    value={entry.clicks}
                    trend={trend}
                    accentColor="emerald"
                    trendLabels={{ trendNew: t('trendNew'), trendNoData: t('trendNoData') }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Country Metrics - Con banderas */}
      {sortedCountries.length > 0 && (
        <div
          className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}
        >
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white flex items-center gap-2">
            🌍 {t('countryMetrics')}
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortedCountries.map((code, index) => {
              const clicks = data.countryTotals[code] || 0;
              const countryName = getCountryName(code);
              const flag = getCountryFlag(code);

              return (
                <button
                  key={code}
                  onClick={() =>
                    handleFiltersChange({ country: code === filters.country ? '' : code })
                  }
                  className={`group relative overflow-hidden rounded-xl border transition-all duration-300 active:scale-95 animate-in fade-in slide-in-from-bottom-2 ${filters.country === code
                    ? 'border-purple-400/60 bg-purple-500/20 shadow-lg shadow-purple-500/20 scale-105'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 hover:scale-102'
                    }`}
                  style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'backwards' }}
                  title={countryName}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${filters.country === code
                      ? 'from-purple-500/10 to-pink-500/10'
                      : 'from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-white/5'
                      } transition-all duration-300`}
                  />

                  <div className="relative flex items-center justify-between p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3 text-left min-w-0 flex-1">
                      {/* Flag emoji */}
                      <div
                        className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg text-2xl sm:text-3xl transition-all duration-300 ${filters.country === code
                          ? 'bg-purple-500/20 scale-110'
                          : 'bg-white/5 group-hover:scale-110'
                          }`}
                      >
                        {flag}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-xs sm:text-sm font-bold text-white truncate"
                          title={countryName}
                        >
                          {countryName}
                        </p>
                        <p className="text-xs text-gray-400">{code}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                        {clicks.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 hidden sm:block">{t('countryClicks')}</p>
                    </div>
                  </div>

                  {/* Selected indicator */}
                  {filters.country === code && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
