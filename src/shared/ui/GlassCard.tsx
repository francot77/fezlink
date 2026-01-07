import { ElementType, ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  accentColor?: 'emerald' | 'cyan' | 'purple' | 'blue' | 'red' | 'yellow' | 'none';
  as?: ElementType;
}

const accents = {
  emerald: {
    gradient: 'from-emerald-500/5 via-transparent to-green-500/5',
    hover: 'hover:border-emerald-400/60 hover:shadow-emerald-500/10',
  },
  cyan: {
    gradient: 'from-cyan-500/5 via-transparent to-blue-500/5',
    hover: 'hover:border-cyan-400/60 hover:shadow-cyan-500/10',
  },
  purple: {
    gradient: 'from-purple-500/5 via-transparent to-pink-500/5',
    hover: 'hover:border-purple-400/60 hover:shadow-purple-500/10',
  },
  blue: {
    gradient: 'from-blue-500/5 via-transparent to-indigo-500/5',
    hover: 'hover:border-blue-400/60 hover:shadow-blue-500/10',
  },
  red: {
    gradient: 'from-red-500/5 via-transparent to-orange-500/5',
    hover: 'hover:border-red-400/60 hover:shadow-red-500/10',
  },
  yellow: {
    gradient: 'from-yellow-500/5 via-transparent to-amber-500/5',
    hover: 'hover:border-yellow-400/60 hover:shadow-yellow-500/10',
  },
  none: {
    gradient: '',
    hover: '',
  },
};

export function GlassCard({
  children,
  className = '',
  onClick,
  hoverEffect = false,
  accentColor = 'none',
  as: Component = 'div',
}: GlassCardProps) {
  const accent = accents[accentColor];

  const baseStyles =
    'group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl transition-all duration-300';
  const hoverStyles = hoverEffect
    ? `hover:border-white/20 hover:shadow-xl ${accent.hover}`
    : '';
  const cursorStyles = onClick ? 'cursor-pointer' : '';

  return (
    <Component
      onClick={onClick}
      className={`${baseStyles} ${hoverStyles} ${cursorStyles} ${className}`}
    >
      {accentColor !== 'none' && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${accent.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
        />
      )}
      <div className="relative z-10">{children}</div>
    </Component>
  );
}
