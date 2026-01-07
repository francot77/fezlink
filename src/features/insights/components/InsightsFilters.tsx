import { Filter } from 'lucide-react';
import { Badge } from '@/shared/ui';
import { useTranslations } from 'next-intl';
import { InsightCategory } from '../hooks/useInsightsDashboard';

interface InsightsFiltersProps {
  categoryFilter: InsightCategory;
  setCategoryFilter: (category: InsightCategory) => void;
  stats: any;
}

export function InsightsFilters({
  categoryFilter,
  setCategoryFilter,
  stats,
}: InsightsFiltersProps) {
  const t = useTranslations('insights');

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <Filter size={16} className="text-gray-400 shrink-0" />
      {(
        ['all', 'traffic', 'geography', 'performance', 'temporal', 'device', 'source'] as const
      ).map((cat) => (
        <button
          key={cat}
          onClick={() => setCategoryFilter(cat)}
          className={`px-3 py-1.5 text-sm rounded-lg transition-all whitespace-nowrap ${categoryFilter === cat
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-gray-800/30 text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
        >
          {cat === 'all' ? t('category.all') : t(`category.${cat}`)}
          {cat !== 'all' && stats && (
            <Badge variant="gray" className="ml-1.5">{stats.byCategory[cat] || 0}</Badge>
          )}
        </button>
      ))}
    </div>
  );
}
