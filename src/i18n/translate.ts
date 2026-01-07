import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export function useT(namespace?: string) {
  return useTranslations(namespace);
}

export async function getT(locale: string, namespace?: string) {
  const t = await getTranslations({ locale, namespace });
  return t;
}

export function withFallback(
  primary: (key: string, values?: Record<string, unknown>) => string,
  fallback?: (key: string, values?: Record<string, unknown>) => string
) {
  return (key: string, values?: Record<string, unknown>) => {
    const result = primary(key, values);
    if (result === key && fallback) {
      return fallback(key, values);
    }
    return result;
  };
}
