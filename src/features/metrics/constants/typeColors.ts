export const typeColorsCard: Record<string, { bg: string; border: string; icon: string }> = {
    positive: {
        bg: 'bg-emerald-500/5 hover:bg-emerald-500/10',
        border: 'border-emerald-500/20',
        icon: 'text-emerald-400',
    },
    opportunity: {
        bg: 'bg-blue-500/5 hover:bg-blue-500/10',
        border: 'border-blue-500/20',
        icon: 'text-blue-400',
    },
    warning: {
        bg: 'bg-yellow-500/5 hover:bg-yellow-500/10',
        border: 'border-yellow-500/20',
        icon: 'text-yellow-400',
    },
    critical: {
        bg: 'bg-red-500/5 hover:bg-red-500/10',
        border: 'border-red-500/20',
        icon: 'text-red-400',
    },
    info: {
        bg: 'bg-gray-500/5 hover:bg-gray-500/10',
        border: 'border-gray-500/20',
        icon: 'text-gray-400',
    },
};

export const typeColorsDetail: Record<
    string,
    { bg: string; border: string; text: string; badge: string }
> = {
    positive: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        text: 'text-emerald-400',
        badge: 'bg-emerald-500/20 text-emerald-400',
    },
    opportunity: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
        badge: 'bg-blue-500/20 text-blue-400',
    },
    warning: {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        text: 'text-yellow-400',
        badge: 'bg-yellow-500/20 text-yellow-400',
    },
    critical: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        text: 'text-red-400',
        badge: 'bg-red-500/20 text-red-400',
    },
    info: {
        bg: 'bg-gray-500/10',
        border: 'border-gray-500/20',
        text: 'text-gray-400',
        badge: 'bg-gray-500/20 text-gray-400',
    },
};

