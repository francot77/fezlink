/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Calendar, Filter, Smartphone, Share2, MapPin, X, ChevronDown } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Card } from '@/shared/ui';
import { MetricsFilters as FiltersType } from '../types/metrics';
import { SupportedLanguage } from '@/types/i18n';
import { formatDeviceLabel, formatSourceLabel } from '../utils/metricsHelpers';
import { useLocale } from 'next-intl';

interface MetricsFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: Partial<FiltersType>) => void;
  onClearFilters: () => void;
  availableCountries: string[];
  availableSources: string[];
  availableDevices: string[];
  translations: any;
  tFn?: (key: string) => string;
  language: SupportedLanguage;
}

export const MetricsFilters: React.FC<MetricsFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  availableCountries,
  availableSources,
  availableDevices,
  translations: t,
  tFn,
  language,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  const locale = useLocale();

  const monthNames = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(currentYear, i, 1);
    return d.toLocaleString(locale, { month: 'long' });
  });

  const hasActiveFilters = filters.country || filters.deviceType || filters.source;

  const applyPreset = (preset: 'week' | 'month' | 'year') => {
    const end = new Date();
    const start = new Date(end);

    if (preset === 'week') start.setDate(end.getDate() - 6);
    else if (preset === 'month') start.setMonth(end.getMonth() - 1);
    else start.setFullYear(end.getFullYear() - 1);

    onFiltersChange({
      endDate: end.toISOString().slice(0, 10),
      startDate: start.toISOString().slice(0, 10),
      activePreset: preset,
      selectedMonth: '',
      selectedYear: '',
    });
  };

  const handleMonthSelect = (monthIndex: number) => {
    const year = filters.selectedYear || currentYear.toString();
    const start = new Date(parseInt(year), monthIndex, 1);
    const end = new Date(parseInt(year), monthIndex + 1, 0);

    onFiltersChange({
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      activePreset: 'custom',
      selectedMonth: monthIndex.toString(),
    });
  };

  const handleYearSelect = (year: string) => {
    onFiltersChange({ selectedYear: year });

    if (filters.selectedMonth) {
      handleMonthSelect(parseInt(filters.selectedMonth));
    } else {
      const start = new Date(parseInt(year), 0, 1);
      const end = new Date(parseInt(year), 11, 31);
      onFiltersChange({
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        activePreset: 'custom',
      });
    }
  };

  return (
    <Card className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />

      {/* Header */}
      <div className="relative p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-left"
          >
            <Filter size={18} className="text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">{t.filters}</h3>
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform sm:hidden ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-300 hover:bg-red-500/20"
            >
              <X size={14} />
              <span className="hidden sm:inline">{t.clearFilters}</span>
            </button>
          )}
        </div>

        {/* Active Filters Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.country && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-1 text-xs text-purple-300">
                <MapPin size={10} />
                {filters.country}
                <button
                  onClick={() => onFiltersChange({ country: '' })}
                  className="ml-1 hover:text-white"
                >
                  <X size={10} />
                </button>
              </span>
            )}
            {filters.deviceType && (
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-1 text-xs text-cyan-300">
                <Smartphone size={10} />
                {formatDeviceLabel(filters.deviceType, tFn ?? ((key) => key))}
                <button
                  onClick={() => onFiltersChange({ deviceType: '' })}
                  className="ml-1 hover:text-white"
                >
                  <X size={10} />
                </button>
              </span>
            )}
            {filters.source && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300">
                <Share2 size={10} />
                {formatSourceLabel(filters.source, tFn ?? ((key) => key))}
                <button
                  onClick={() => onFiltersChange({ source: '' })}
                  className="ml-1 hover:text-white"
                >
                  <X size={10} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Expandable Content */}
      <div
        className={`relative space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6 ${isExpanded ? 'block' : 'hidden sm:block'}`}
      >
        {/* Quick Ranges */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">{t.quickRanges}</label>
          <div className="flex flex-wrap gap-2">
            {(['week', 'month', 'year'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => applyPreset(preset)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${filters.activePreset === preset
                  ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-500/20'
                  : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10'
                  }`}
              >
                {t[preset === 'week' ? 'lastWeek' : preset === 'month' ? 'lastMonth' : 'lastYear']}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
              <Calendar size={14} className="text-emerald-400" />
              {t.from}
            </label>
            <input
              type="date"
              value={filters.startDate}
              max={filters.endDate}
              onChange={(e) =>
                onFiltersChange({
                  startDate: e.target.value,
                  activePreset: 'custom',
                  selectedMonth: '',
                  selectedYear: '',
                })
              }
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white backdrop-blur-sm transition focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
              <Calendar size={14} className="text-cyan-400" />
              {t.to}
            </label>
            <input
              type="date"
              value={filters.endDate}
              min={filters.startDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) =>
                onFiltersChange({
                  endDate: e.target.value,
                  activePreset: 'custom',
                  selectedMonth: '',
                  selectedYear: '',
                })
              }
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white backdrop-blur-sm transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
        </div>

        {/* Filter Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
              <Smartphone size={14} className="text-cyan-400" />
              {t.deviceType}
            </label>
            <Select
              value={filters.deviceType}
              onChange={(v) => onFiltersChange({ deviceType: v })}
              options={availableDevices.map((device) => ({
                value: device,
                label: formatDeviceLabel(device, tFn ?? ((key) => key)),
              }))}
              placeholder={t.allDevices}
              accent="cyan"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
              <Share2 size={14} className="text-emerald-400" />
              {t.source}
            </label>
            <Select
              value={filters.source}
              onChange={(v) => onFiltersChange({ source: v })}
              options={availableSources.map((src) => ({
                value: src,
                label: formatSourceLabel(src, tFn ?? ((key) => key)),
              }))}
              placeholder={t.allSources}
              accent="emerald"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
              <MapPin size={14} className="text-purple-400" />
              {t.country}
            </label>
            <Select
              value={filters.country}
              onChange={(v) => onFiltersChange({ country: v })}
              options={availableCountries.map((c) => ({
                value: c,
                label: c,
              }))}
              placeholder={t.all}
              accent="purple"
            />
          </div>
        </div>

        {/* Month Selector (collapsible on mobile) */}
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-gray-300 list-none flex items-center justify-between">
            <span>{t.specificMonth}</span>
            <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {monthNames.map((month, index) => (
              <button
                key={month}
                onClick={() => handleMonthSelect(index)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${filters.selectedMonth === index.toString()
                  ? 'border-purple-400/60 bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-500/20'
                  : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10'
                  }`}
              >
                {month}
              </button>
            ))}
          </div>
        </details>

        {/* Year Selector */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">{t.specificYear}</label>
          <div className="flex flex-wrap gap-2">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => handleYearSelect(year)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${filters.selectedYear === year
                  ? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
                  : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10'
                  }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
