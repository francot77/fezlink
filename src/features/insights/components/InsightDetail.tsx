/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowDownRight, ArrowUpRight, X } from 'lucide-react';
import { MiniChart } from './MiniChart';
import { createPortal } from 'react-dom';
import { formatMetricValue } from '@/features/metrics/utils/format';
import { typeColorsDetail } from '@/features/metrics/constants/typeColors';
import { useTranslations } from 'next-intl';

interface InsightDetailProps {
  insight: any;
  onClose: () => void;
}

export function InsightDetail({ insight, onClose }: InsightDetailProps) {
  if (typeof window === 'undefined') return null;
  const Icon = insight.icon;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations('insights');

  const colors = typeColorsDetail[insight.type] || typeColorsDetail.info;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0b1224] rounded-xl border border-gray-800 shadow-2xl">
        {/* Header */}
        <div className={`sticky top-0 p-6 border-b ${colors.border} ${colors.bg} backdrop-blur-sm`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${colors.bg} ${colors.text}`}>
                <Icon size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">{insight.title}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${colors.badge}`}>
                    {insight.type}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{insight.description}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Primary Metric */}
          {insight.metricValue !== undefined && (
            <div className={`p-4 rounded-xl border ${colors.border} ${colors.bg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{t('primaryValue')}</p>
                  <p className={`text-3xl font-bold ${colors.text}`}>
                    {formatMetricValue(insight.metricValue, insight.metricUnit)}
                  </p>
                </div>

                {insight.metricDelta !== undefined && (
                  <div className={`flex flex-col items-end`}>
                    <div className={`flex items-center gap-1 ${colors.text}`}>
                      {insight.metricDelta >= 0 ? (
                        <ArrowUpRight size={20} />
                      ) : (
                        <ArrowDownRight size={20} />
                      )}
                      <span className="text-2xl font-bold">
                        {Math.abs(insight.metricDelta).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t('vsPrevPeriod')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chart */}
          {insight.chartData && insight.chartData.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">{t('trend')}</h4>
              <div className={`p-4 rounded-xl border ${colors.border} bg-gray-900/50`}>
                <MiniChart data={insight.chartData} color={colors.text} />
              </div>
            </div>
          )}

          {/* Detail Text */}
          {insight.detail && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">{t('details')}</h4>
              <p className="text-gray-300 leading-relaxed">{insight.detail}</p>
            </div>
          )}

          {/* Metadata */}
          {insight.metadata && Object.keys(insight.metadata).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">{t('additionalInfo')}</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(insight.metadata).map(([key, value]: [string, any]) => (
                  <div key={key} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                    <p className="text-xs text-gray-500 mb-1">{formatMetadataKey(key)}</p>
                    <p className="text-sm text-white font-medium">{formatMetadataValue(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related IDs */}
          {insight.relatedIds && insight.relatedIds.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">{t('relatedItems')}</h4>
              <div className="flex flex-wrap gap-2">
                {insight.relatedIds.map((id: string, i: number) => (
                  <div
                    key={i}
                    className={`px-3 py-1.5 rounded-lg border ${colors.border} ${colors.bg} text-sm ${colors.text}`}
                  >
                    {id}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Priority and Category */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
            <div>
              <p className="text-xs text-gray-500 mb-1">{t('priority')}</p>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${i < Math.floor(insight.priority / 20)
                      ? colors.text.replace('text-', 'bg-')
                      : 'bg-gray-700'
                      }`}
                  />
                ))}
              </div>
            </div>

            <div className="h-8 w-px bg-gray-800" />

            <div>
              <p className="text-xs text-gray-500 mb-1">{t('categoryLabel')}</p>
              <p className="text-sm text-white capitalize">{insight.category}</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function formatMetadataKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function formatMetadataValue(value: any): string {
  if (typeof value === 'number') {
    if (value > 1000) return value.toLocaleString();
    return value.toFixed(0);
  }
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  return String(value);
}
