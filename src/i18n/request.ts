import { getRequestConfig } from 'next-intl/server'
import { headers } from 'next/headers'

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
}

async function getCountryFromHeaders(): Promise<string | null> {
    const headersList = headers()

    // Vercel/Cloudflare geo headers
    const country =
        (await headersList).get('x-vercel-ip-country') ||
        (await headersList).get('cf-ipcountry') ||
        (await headersList).get('x-country-code')

    return country
}

function getLocaleFromCountry(country: string | null): string {
    if (!country) return 'en' // Default a inglés si no se detecta

    const locale = countryToLocale[country.toUpperCase()]
    return locale || 'en' // Si el país no está mapeado, usar inglés
}

export default getRequestConfig(async ({ locale }) => {
    // Si ya hay un locale en la URL, usarlo
    if (locale) {
        return {
            locale,
            messages: (await import(`../locales/${locale}/landing.json`)).default
        }
    }

    // Detectar país y asignar idioma
    const country = getCountryFromHeaders()
    const detectedLocale = getLocaleFromCountry(await country)

    return {
        locale: detectedLocale,
        messages: (await import(`../locales/${detectedLocale}/landing.json`)).default
    }
})