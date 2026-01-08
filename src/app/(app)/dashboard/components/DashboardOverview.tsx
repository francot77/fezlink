'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ArrowUpRight, MousePointer2, Link as LinkIcon, Activity, TrendingUp } from 'lucide-react';
import { Link } from '@/hooks/useLinks';
import { useTranslations } from 'next-intl';

interface DashboardOverviewProps {
  links: Link[];
  onSelectLink: (linkId: string) => void;
}

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#6b7280'];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ links, onSelectLink }) => {
  const t = useTranslations('metrics.overview');

  // 1. Calculate KPIs
  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
  const avgClicks = totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0;

  // 2. Prepare Chart Data
  // Top 5 Links by Clicks
  const sortedLinks = [...links].sort((a, b) => b.clicks - a.clicks);
  const topLinks = sortedLinks.slice(0, 5).map((link) => ({
    name: link.slug || link.shortUrl,
    clicks: link.clicks,
    fullUrl: link.destinationUrl,
    id: link.id,
  }));

  // Pie Chart Data (Top 5 vs Others)
  const top5Clicks = topLinks.reduce((sum, item) => sum + item.clicks, 0);
  const otherClicks = totalClicks - top5Clicks;
  
  const pieData = [
    ...topLinks.map(l => ({ name: l.name, value: l.clicks })),
  ];
  if (otherClicks > 0) {
    pieData.push({ name: t('others'), value: otherClicks });
  }

  // Custom Tooltip for Bar Chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-white/10 bg-gray-900/95 p-3 shadow-xl backdrop-blur-md">
          <p className="mb-1 text-sm font-semibold text-white">{label}</p>
          <p className="text-xs text-gray-400 mb-2">{payload[0].payload.fullUrl}</p>
          <p className="text-sm font-bold text-emerald-400">
            {payload[0].value.toLocaleString()} {t('activeLinksDesc').includes('URLs') ? 'clicks' : 'clics'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Card 1: Total Clicks */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 via-[#111827] to-gray-900 p-6 shadow-xl transition-all hover:scale-[1.02] hover:shadow-emerald-500/10">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <MousePointer2 size={64} className="text-emerald-500" />
          </div>
          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400">
                <MousePointer2 size={20} />
              </div>
              <span className="text-sm font-medium text-gray-400">{t('totalClicksDesc').split(' ').slice(0, 2).join(' ')}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-white">{totalClicks.toLocaleString()}</h3>
            </div>
            <p className="mt-2 text-xs text-gray-500">{t('totalClicksDesc')}</p>
          </div>
          {/* Decorative Gradient Line */}
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-transparent opacity-50" />
        </div>

        {/* Card 2: Total Links */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 via-[#111827] to-gray-900 p-6 shadow-xl transition-all hover:scale-[1.02] hover:shadow-blue-500/10">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <LinkIcon size={64} className="text-blue-500" />
          </div>
          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-blue-500/20 p-2 text-blue-400">
                <LinkIcon size={20} />
              </div>
              <span className="text-sm font-medium text-gray-400">{t('activeLinks')}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-white">{totalLinks.toLocaleString()}</h3>
              <span className="flex items-center text-xs font-medium text-blue-400">
                <Activity size={12} className="mr-0.5" /> {t('active')}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500">{t('activeLinksDesc')}</p>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-transparent opacity-50" />
        </div>

        {/* Card 3: Avg Clicks */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 via-[#111827] to-gray-900 p-6 shadow-xl transition-all hover:scale-[1.02] hover:shadow-purple-500/10">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp size={64} className="text-purple-500" />
          </div>
          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-purple-500/20 p-2 text-purple-400">
                <TrendingUp size={20} />
              </div>
              <span className="text-sm font-medium text-gray-400">{t('avgClicksLink')}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-white">{avgClicks.toLocaleString()}</h3>
            </div>
            <p className="mt-2 text-xs text-gray-500">{t('avgPerformance')}</p>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-transparent opacity-50" />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Main Chart: Top Performing Links */}
        <div className="col-span-1 lg:col-span-2 rounded-2xl border border-white/10 bg-gray-900/50 p-6 backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">{t('topPerforming')}</h3>
              <p className="text-sm text-gray-400">{t('topPerformingDesc')}</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topLinks} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar 
                  dataKey="clicks" 
                  fill="url(#barGradient)" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                  onClick={(data) => onSelectLink(data.id)}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart: Distribution */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-6 backdrop-blur-xl flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white">{t('engagementShare')}</h3>
            <p className="text-sm text-gray-400">{t('trafficDistribution')}</p>
          </div>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }}
                   itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{totalClicks > 0 ? '100%' : '0%'}</p>
                <p className="text-xs text-gray-500">{t('traffic')}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
             {topLinks.slice(0, 3).map((link, idx) => (
               <div key={link.id} className="flex items-center justify-between text-sm">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                   <span className="text-gray-300 truncate max-w-[120px]">{link.name}</span>
                 </div>
                 <span className="text-gray-500">{Math.round((link.clicks / totalClicks) * 100)}%</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};
