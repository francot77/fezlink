'use client';
import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  TooltipProps,
  BarChart,
  Bar,
} from 'recharts';
import { TrendingUp, CalendarDays, BarChart3, LineChart, Activity } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Badge } from '@/shared/ui';

interface Stat {
  _id: string;
  clicks: number;
  displayDate?: string;
  isMonthly?: boolean;
}

interface MetricsChartProps {
  stats: Stat[];
  chartType?: 'line' | 'bar';
  isMonthly?: boolean;
}

export default function MetricsChart({
  stats,
  chartType: initialChartType = 'line',
  isMonthly = false,
}: MetricsChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>(initialChartType);
  const t = useTranslations('metrics');
  const locale = useLocale();

  const formatMonthlyDate = (dateStr: string) => {
    const [year, month] = dateStr.split('-').map((v) => parseInt(v, 10));
    const d = new Date(year, (month || 1) - 1, 1);
    return d.toLocaleString(locale, { month: 'short' });
  };

  const formatDailyDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map((v) => parseInt(v, 10));
    const d = new Date(year, (month || 1) - 1, day || 1);
    return d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
  };

  const formatTooltipDate = (dateStr: string, isMonthly: boolean) => {
    const parts = dateStr.split('-').map((v) => parseInt(v, 10));
    if (isMonthly) {
      const d = new Date(parts[0], (parts[1] || 1) - 1, 1);
      const monthFull = d.toLocaleString(locale, { month: 'long' });
      return `${monthFull} ${d.getFullYear()}`;
    }
    const d = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
    return d.toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const data = stats.map((stat) => {
    const displayDate =
      stat.displayDate || (isMonthly ? formatMonthlyDate(stat._id) : formatDailyDate(stat._id));

    const fullDate = formatTooltipDate(stat._id, stat.isMonthly || isMonthly);

    return {
      date: displayDate,
      fullDate,
      clicks: stat.clicks,
      rawDate: stat._id,
      isMonthly: stat.isMonthly || isMonthly,
    };
  });

  const maxClicks = Math.max(...data.map((d) => d.clicks), 0);
  const totalClicks = data.reduce((sum, d) => sum + d.clicks, 0);
  const avgClicks = data.length > 0 ? Math.round(totalClicks / data.length) : 0;
  const peakDate = data.find((d) => d.clicks === maxClicks)?.fullDate || '';
  const minClicks = Math.min(...data.map((d) => d.clicks), 0);

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;

    const clicks = payload[0].value || 0;
    const date = payload[0].payload.fullDate;
    const isMonthlyData = payload[0].payload.isMonthly;

    return (
      <div className="relative overflow-hidden rounded-xl border border-white/20 bg-gray-900/98 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" />
        <div className="relative px-4 py-3 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-medium text-gray-400">{date}</p>
            {isMonthlyData && (
              <Badge variant="purple" className="flex items-center gap-1">
                <CalendarDays size={10} />
                {t('chart.monthly')}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400" />
            <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {clicks.toLocaleString()}
            </p>
            <span className="text-sm text-gray-400">{t('chart.clicksLabel')}</span>
          </div>
        </div>
      </div>
    );
  };

  if (data.length === 0) return null;

  const renderChart = () => {
    if (chartType === 'bar') {
      return (
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar
            dataKey="clicks"
            fill="url(#barGradient)"
            radius={[6, 6, 0, 0]}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </BarChart>
      );
    }

    // Default to area chart
    return (
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{
            stroke: '#10b981',
            strokeWidth: 2,
            strokeDasharray: '5 5',
            opacity: 0.3,
          }}
        />
        <Area
          type="monotone"
          dataKey="clicks"
          stroke="url(#strokeGradient)"
          strokeWidth={3}
          fill="url(#clicksGradient)"
          dot={{
            r: 4,
            fill: '#0f172a',
            strokeWidth: 2,
            stroke: '#10b981',
          }}
          activeDot={{
            r: 6,
            fill: '#10b981',
            stroke: '#0f172a',
            strokeWidth: 2,
            filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))',
          }}
          animationDuration={1500}
          animationEasing="ease-out"
        />
      </AreaChart>
    );
  };

  return (
    <div className="space-y-4">
      {/* Stats summary - Horizontal scrollable en mobile */}
      <div className="relative ">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto p-2 scrollbar-hide snap-x snap-mandatory">
          {/* Total */}
          <div className="shrink-0 w-2 sm:hidden snap-start" />
          <div className="group relative snap-start shrink-0 flex-1 min-w-[140px] sm:min-w-0 rounded-lg bg-gradient-to-br from-emerald-500/10 to-green-500/10 px-3 py-2.5 ring-1 ring-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-green-500/0 group-hover:from-emerald-500/10 group-hover:to-green-500/10 rounded-lg transition-all duration-300" />
            <div className="relative flex items-center gap-2">
              <Activity size={16} className="text-emerald-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 truncate">{t('chart.total')}</p>
                <p
                  className="text-base sm:text-lg font-bold text-white truncate"
                  title={totalClicks.toLocaleString()}
                >
                  {totalClicks.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Promedio */}
          <div className="group relative snap-start shrink-0 flex-1 min-w-[140px] sm:min-w-0 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 px-3 py-2.5 ring-1 ring-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 rounded-lg transition-all duration-300" />
            <div className="relative flex items-center gap-2">
              <TrendingUp size={16} className="text-cyan-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 truncate">{t('chart.average')}</p>
                <p
                  className="text-base sm:text-lg font-bold text-white truncate"
                  title={avgClicks.toLocaleString()}
                >
                  {avgClicks.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Máximo */}
          <div className="group relative snap-start shrink-0 flex-1 min-w-[140px] sm:min-w-0 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 px-3 py-2.5 ring-1 ring-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 rounded-lg transition-all duration-300" />
            <div className="relative flex items-center gap-2">
              <div className="text-purple-400 shrink-0">📈</div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 truncate">{t('chart.max')}</p>
                <p
                  className="text-base sm:text-lg font-bold text-white truncate"
                  title={maxClicks.toLocaleString()}
                >
                  {maxClicks.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Pico */}
          <div className="group relative snap-start shrink-0 flex-1 min-w-[140px] sm:min-w-0 rounded-lg bg-gradient-to-br from-orange-500/10 to-yellow-500/10 px-3 py-2.5 ring-1 ring-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-yellow-500/0 group-hover:from-orange-500/10 group-hover:to-yellow-500/10 rounded-lg transition-all duration-300" />
            <div className="relative flex items-center gap-2">
              <CalendarDays size={16} className="text-orange-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 truncate">
                  {isMonthly ? t('chart.peakMonth') : t('chart.peakDay')}
                </p>
                <p className="text-xs sm:text-sm font-bold text-white truncate" title={peakDate}>
                  {peakDate.split(' ')[0]}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Scroll hint para mobile */}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {isMonthly && (
            <Badge variant="purple" className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
              <CalendarDays size={12} />
              <span className="text-xs font-medium">{t('chart.monthlyBadge')}</span>
            </Badge>
          )}
          {minClicks > 0 && (
            <Badge variant="blue" className="flex items-center gap-1.5">
              <span className="text-xs">{t('chart.minLabel')} {minClicks}</span>
            </Badge>
          )}
        </div>

        {/* Chart type toggle */}
        <div className="flex items-center gap-2 rounded-lg bg-white/5 p-1 ring-1 ring-white/10">
          <button
            onClick={() => setChartType('line')}
            className={`flex min-h-[32px] items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
              chartType === 'line'
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LineChart size={14} />
            <span className="hidden sm:inline">{t('chart.type.line')}</span>
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`flex min-h-[32px] items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
              chartType === 'bar'
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 size={14} />
            <span className="hidden sm:inline">{t('chart.type.bar')}</span>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl bg-gradient-to-br from-gray-900/40 to-black/40 p-3 sm:p-4 ring-1 ring-white/5">
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded ${
              chartType === 'bar'
                ? 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                : 'bg-gradient-to-r from-emerald-500/40 to-cyan-500/40'
            }`}
          />
          <span>{t('legend.totalClicks')}</span>
        </div>
        {data.length > 1 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-600" />
            <span>{t('legend.periods', { count: data.length })}</span>
          </div>
        )}
      </div>
    </div>
  );
}
