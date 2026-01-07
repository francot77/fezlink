import { getBaseColorStyle } from '@/utils/backgroundImageStyles';
import React from 'react';

interface Props {
  bgColor: string;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

export default function BackgroundPreview({ bgColor, className, style, ariaLabel }: Props) {
  const baseStyle = getBaseColorStyle(bgColor);
  return <div className={className} style={{ ...baseStyle, ...style }} aria-label={ariaLabel} />;
}
