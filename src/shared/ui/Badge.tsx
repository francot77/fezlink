import React from 'react';

type Variant =
    | 'default'
    | 'blue'
    | 'emerald'
    | 'purple'
    | 'amber'
    | 'red'
    | 'cyan'
    | 'gray';

interface BadgeProps {
    children: React.ReactNode;
    variant?: Variant;
    className?: string;
}

const styles: Record<Variant, string> = {
    default: 'bg-white/5 text-gray-300',
    blue: 'bg-blue-500/20 text-blue-200',
    emerald: 'bg-emerald-500/20 text-emerald-200',
    purple: 'bg-purple-500/20 text-purple-200',
    amber: 'bg-amber-500/20 text-amber-200',
    red: 'bg-red-500/20 text-red-200',
    cyan: 'bg-cyan-500/20 text-cyan-200',
    gray: 'bg-gray-800 text-gray-300',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${styles[variant]} ${className}`}
        >
            {children}
        </span>
    );
};

