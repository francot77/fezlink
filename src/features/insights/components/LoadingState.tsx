// components/insights/LoadingState.tsx
import { Sparkles } from 'lucide-react';

interface LoadingStateProps {
  message: string;
  submessage?: string;
  showSpinner?: boolean;
}

export function LoadingState({ message, submessage, showSpinner = false }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      <div className="relative">
        {showSpinner ? (
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        ) : (
          <Sparkles className="w-16 h-16 text-emerald-400 animate-pulse" />
        )}
      </div>

      <div className="text-center space-y-2">
        <p className="text-lg text-white font-medium">{message}</p>
        {submessage && <p className="text-sm text-gray-400">{submessage}</p>}
      </div>

      {showSpinner && (
        <div className="flex gap-2">
          {[0, 0.15, 0.3].map((delay, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// components/insights/EmptyState.tsx
import { Lightbulb, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  onRefresh: () => void;
}

export function EmptyState({ onRefresh }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      <div className="p-6 rounded-full bg-gray-800/50 border border-gray-700">
        <Lightbulb size={48} className="text-gray-500" />
      </div>

      <div className="text-center space-y-2 max-w-md">
        <h3 className="text-xl font-semibold text-white">No hay insights disponibles</h3>
        <p className="text-sm text-gray-400">
          No se detectaron patrones significativos en este período. Intenta con un período diferente
          o genera más actividad en tus links.
        </p>
      </div>

      <button
        onClick={onRefresh}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
      >
        <RefreshCw size={16} />
        <span>Refrescar</span>
      </button>
    </div>
  );
}
