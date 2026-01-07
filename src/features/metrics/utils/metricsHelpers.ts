export const deviceIcons: Record<string, string> = {
  mobile: '📱',
  desktop: '💻',
  tablet: '📱',
  default: '❓',
};

export const sourceIcons: Record<string, string> = {
  instagram: '📸',
  instagram_bio: '📸',
  whatsapp: '💬',
  qr_local: '🔲',
  direct: '🔗',
  referral: '🔄',
  facebook: '📘',
  twitter: '🐦',
  linkedin: '💼',
  email: '📧',
  tiktok: '🎵',
  pinterest: '📌',
  default: '🌐',
};

export const getDeviceIcon = (type: string): string => {
  return deviceIcons[type] || deviceIcons.default;
};

export const getSourceIcon = (source: string): string => {
  return sourceIcons[source] || sourceIcons.default;
};

export const formatDeviceLabel = (type: string, t: (key: string) => string): string => {
  const key = `labels.device.${type}`;
  const label = t(key);
  if (label === key) return t('labels.device.unknown');
  return label;
};

export const formatSourceLabel = (value: string, t: (key: string) => string): string => {
  const key = `labels.source.${value}`;
  const preset = t(key);
  if (preset !== key) return preset;

  const normalized = value.replace(/[_-]+/g, ' ');
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};
