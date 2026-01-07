import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

// Mapeo de países a idiomas
const countryToLocale: Record<string, string> = {
  // Países de habla hispana
  AR: 'es', // Argentina
  ES: 'es', // España
  MX: 'es', // México
  CO: 'es', // Colombia
  CL: 'es', // Chile
  PE: 'es', // Perú
  VE: 'es', // Venezuela
  EC: 'es', // Ecuador
  GT: 'es', // Guatemala
  CU: 'es', // Cuba
  BO: 'es', // Bolivia
  DO: 'es', // República Dominicana
  HN: 'es', // Honduras
  PY: 'es', // Paraguay
  SV: 'es', // El Salvador
  NI: 'es', // Nicaragua
  CR: 'es', // Costa Rica
  PA: 'es', // Panamá
  UY: 'es', // Uruguay

  // Países de habla inglesa (default)
  US: 'en', // Estados Unidos
  GB: 'en', // Reino Unido
  CA: 'en', // Canadá
  AU: 'en', // Australia
  NZ: 'en', // Nueva Zelanda
  IE: 'en', // Irlanda
  // Agrega más países según necesites
};

async function getCountryFromHeaders(): Promise<string | null> {
  const headersList = headers();

  // Vercel/Cloudflare geo headers
  const country =
    (await headersList).get('x-vercel-ip-country') ||
    (await headersList).get('cf-ipcountry') ||
    (await headersList).get('x-country-code');

  return country;
}

function getLocaleFromCountry(country: string | null): string {
  if (!country) return 'en'; // Default a inglés si no se detecta

  const locale = countryToLocale[country.toUpperCase()];
  return locale || 'en'; // Si el país no está mapeado, usar inglés
}

function deepMerge(target: Record<string, any>, source: Record<string, any>) {
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = target[key];
    if (srcVal && typeof srcVal === 'object' && !Array.isArray(srcVal)) {
      target[key] = deepMerge(tgtVal && typeof tgtVal === 'object' ? { ...tgtVal } : {}, srcVal);
    } else {
      target[key] = srcVal;
    }
  }
  return target;
}

async function loadMessages(locale: string) {
  const landing = (await import(`../locales/${locale}/landing.json`)).default;
  let metrics: Record<string, any> = {};
  let common: Record<string, any> = {};
  let links: Record<string, any> = {};
  let insights: Record<string, any> = {};
  let dashboard: Record<string, any> = {};

  try {
    metrics = (await import(`../locales/${locale}/metrics.json`)).default;
  } catch { }
  try {
    common = (await import(`../locales/${locale}/common.json`)).default;
  } catch { }
  try {
    links = (await import(`../locales/${locale}/links.json`)).default;
  } catch { }
  try {
    insights = (await import(`../locales/${locale}/insights.json`)).default;
  } catch { }
  try {
    dashboard = (await import(`../locales/${locale}/dashboard.json`)).default;
  } catch { }

  // Merge por namespace para que falten keys dentro de un namespace se conserven
  let messages = deepMerge(deepMerge({}, landing), deepMerge(common, metrics));
  messages = deepMerge(messages, links);
  messages = deepMerge(messages, { insights });
  messages = deepMerge(messages, dashboard);
  return messages;
}

export default getRequestConfig(async ({ locale }) => {
  const fallbackLocale = 'en';

  // Detectar país y asignar idioma
  const country = getCountryFromHeaders();
  const detectedLocale = getLocaleFromCountry(await country);
  const finalLocale = locale || detectedLocale;

  // Cargar mensajes con fallback
  const fallbackMessages = await loadMessages(fallbackLocale);
  const currentMessages = await loadMessages(finalLocale);
  const mergedMessages = deepMerge({ ...fallbackMessages }, currentMessages);

  return {
    locale: finalLocale,
    messages: mergedMessages,
  };
});
