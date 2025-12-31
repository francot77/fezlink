import { SupportedLanguage } from '@/types/i18n';

export const deviceIcons: Record<string, string> = {
    mobile: '📱',
    desktop: '💻',
    tablet: '📱',
    default: '❓'
};

export const sourceIcons: Record<string, string> = {
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
    default: '🌐'
};

export const deviceLabels = {
    en: { mobile: 'Mobile', desktop: 'Desktop', tablet: 'Tablet', unknown: 'Unknown' },
    es: { mobile: 'Móvil', desktop: 'Escritorio', tablet: 'Tableta', unknown: 'Desconocido' }
};

export const sourceLabels = {
    en: {
        instagram_bio: 'Instagram',
        whatsapp: 'WhatsApp',
        qr_local: 'QR Code',
        direct: 'Direct',
        referral: 'Referral',
        facebook: 'Facebook',
        twitter: 'Twitter',
        linkedin: 'LinkedIn',
        email: 'Email',
        tiktok: 'TikTok',
        pinterest: 'Pinterest'
    },
    es: {
        instagram_bio: 'Instagram',
        whatsapp: 'WhatsApp',
        qr_local: 'Código QR',
        direct: 'Directo',
        referral: 'Referencia',
        facebook: 'Facebook',
        twitter: 'Twitter',
        linkedin: 'LinkedIn',
        email: 'Email',
        tiktok: 'TikTok',
        pinterest: 'Pinterest'
    }
};

export const getDeviceIcon = (type: string): string => {
    return deviceIcons[type] || deviceIcons.default;
};

export const getSourceIcon = (source: string): string => {
    return sourceIcons[source] || sourceIcons.default;
};

export const formatDeviceLabel = (type: string, language: SupportedLanguage): string => {
    const labels = deviceLabels[language];
    return labels[type as keyof typeof labels] || labels.unknown;
};

export const formatSourceLabel = (value: string, language: SupportedLanguage): string => {
    const preset = sourceLabels[language][value as keyof typeof sourceLabels.en];
    if (preset) return preset;

    const normalized = value.replace(/[_-]+/g, ' ');
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};