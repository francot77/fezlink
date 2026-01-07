import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    as?: React.ElementType;
    borderStyle?: 'solid' | 'dashed';
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    as = 'div',
    borderStyle = 'solid',
}) => {
    const Tag = (as ?? 'div') as React.ElementType;
    const base =
        'overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl';
    const border =
        borderStyle === 'dashed' ? 'border border-dashed border-white/10' : 'border border-white/10';

    return <Tag className={`${base} ${border} ${className}`}>{children}</Tag>;
};

