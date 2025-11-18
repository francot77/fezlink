import { usePaddle } from "@/hooks/usePaddle";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { SupportedLanguage } from "@/types/i18n";
const translations: Record<SupportedLanguage, { [key: string]: string }> = {
    en: {
        benefits: 'Premium Benefits',
        customSlug: 'Custom slug',
        unlimited: 'Unlimited links',
        support: 'Priority support',
        dashboard: 'Analytics dashboard',
        adfree: 'Ad-free experience',
        pricing: 'Pricing',
        monthly: 'Monthly Billing',
        annual: 'Annual Billing',
        upgradeMonthly: 'Upgrade Monthly',
        upgradeAnnual: 'Upgrade Annually',
        perMonth: '$2.5/month',
        perMonthAnnual: '$2/month',
    },
    es: {
        benefits: 'Beneficios Premium',
        customSlug: 'Slug personalizado',
        unlimited: 'Links ilimitados',
        support: 'Soporte prioritario',
        dashboard: 'Panel de analíticas',
        adfree: 'Experiencia sin anuncios',
        pricing: 'Precios',
        monthly: 'Facturación mensual',
        annual: 'Facturación anual',
        upgradeMonthly: 'Mejorar mensualmente',
        upgradeAnnual: 'Mejorar anualmente',
        perMonth: '$2.5/mes',
        perMonthAnnual: '$2/mes',
    },
};

const PremiumFeatures = ({ priceId, time, language = 'en' }: { priceId: string; time: string; language?: SupportedLanguage }) => {
    const t = translations[language];
    const auth = useAuth()
    const paddle = usePaddle()
    const handleCheckout = () => {
        if (!auth.userId) redirect("/")
        if (!paddle) return;
        paddle.Checkout.open({
            items: [{ priceId: priceId, quantity: 1 }],
            customer: {
                email: 'user@example.com',
            },
        });
    };

    return <div className="grid place-items-center min-h-[50vh]"><div className="max-w-sm m-auto bg-gray-800 dark:bg-gray-800 shadow-lg rounded-xl p-6 transition-transform transform hover:scale-105">
        <h1 className="text-2xl font-bold text-white mb-4">{t.benefits}</h1>

        <ul className="text-left space-y-2 mb-6">
            <li className="flex items-center gap-2">
                <span className="text-green-400">✔</span>
                <span className="text-gray-300">{t.customSlug}</span>
            </li>
            <li className="flex items-center gap-2">
                <span className="text-green-400">✔</span>
                <span className="text-gray-300">{t.unlimited}</span>
            </li>
            <li className="flex items-center gap-2">
                <span className="text-green-400">✔</span>
                <span className="text-gray-300">{t.support}</span>
            </li>
            <li className="flex items-center gap-2">
                <span className="text-green-400">✔</span>
                <span className="text-gray-300">{t.dashboard}</span>
            </li>
            <li className="flex items-center gap-2">
                <span className="text-green-400">✔</span>
                <span className="text-gray-300">{t.adfree}</span>
            </li>
        </ul>

        <div className="mb-6">
            <h2 className="font-semibold text-gray-400 mb-2">{t.pricing}</h2>
            {time == "anual" ? <p className="text-sm text-gray-500">{t.perMonthAnnual} - {t.annual}</p> : null}
            {time == "mensual" ? <p className="text-sm text-gray-500">{t.perMonth} - {t.monthly}</p> : null}
        </div>

        <button onClick={handleCheckout} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300">
            {time == "mensual" ? t.upgradeMonthly : t.upgradeAnnual}
        </button>
    </div></div>
}

export default PremiumFeatures;