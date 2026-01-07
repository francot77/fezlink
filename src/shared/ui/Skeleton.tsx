import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    rounded?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    width,
    height,
    rounded = 'rounded',
}) => {
    const style = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    } as React.CSSProperties;
    return <div className={`bg-white/5 ${rounded} animate-pulse ${className}`} style={style} />;
};

