import { usePaddle } from "@/hooks/usePaddle";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { SupportedLanguage } from "@/types/i18n";

const translations: Record<SupportedLanguage, { [key: string]: string }> = {
    en: {
        title: 'Manage subscription',
        subtitle: 'Upgrade or review your billing preferences',
        customSlug: 'Custom slug',
        unlimited: 'Unlimited links',
        support: 'Priority support',
        dashboard: 'Analytics dashboard',
        adfree: 'Ad-free experience',
        pricing: 'Pricing',
        monthly: 'Monthly Billing',
        annual: 'Annual Billing',
        upgradeMonthly: 'Upgrade monthly',
        upgradeAnnual: 'Upgrade annually',
        perMonth: '$2.5/month',
        perMonthAnnual: '$2/month',
        cancel: 'Cancel subscription',
        cancelHint: 'Cancel option coming soon',
    },
    es: {
        title: 'Administrar suscripción',
        subtitle: 'Mejora o revisa tus preferencias de facturación',
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
        cancel: 'Cancelar suscripción',
        cancelHint: 'La opción para cancelar llegará pronto',
    },
};

const BENEFITS = ['customSlug', 'unlimited', 'support', 'dashboard', 'adfree'] as const;

const PremiumFeatures = ({ priceId, time, language = 'en' }: { priceId: string; time: string; language?: SupportedLanguage }) => {
    const t = translations[language];
    const auth = useAuth();
    const paddle = usePaddle();

    const handleCheckout = () => {
        if (!auth.userId) redirect("/");
        if (!paddle) return;
        paddle.Checkout.open({
            items: [{ priceId: priceId, quantity: 1 }],
            customer: {
                email: 'user@example.com',
            },
        });
    };

    const billingCopy = time === 'anual'
        ? { price: t.perMonthAnnual, cadence: t.annual, cta: t.upgradeAnnual }
        : { price: t.perMonth, cadence: t.monthly, cta: t.upgradeMonthly };

    return (
        <div className="min-h-[50vh] w-full max-w-sm">
            <div className="m-auto rounded-xl border border-gray-800 bg-gray-800 p-6 shadow-lg transition-transform hover:scale-[1.01]">
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                        <p className="text-sm text-gray-400">{t.subtitle}</p>
                        <h1 className="text-2xl font-bold text-white">{t.title}</h1>
                    </div>
                    <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs uppercase text-blue-200">{billingCopy.cadence}</span>
                </div>

                <ul className="mb-6 space-y-2">
                    {BENEFITS.map((benefitKey) => (
                        <li key={benefitKey} className="flex items-center gap-2 text-gray-300">
                            <span className="text-green-400">✔</span>
                            <span>{t[benefitKey]}</span>
                        </li>
                    ))}
                </ul>

                <div className="mb-4">
                    <h2 className="text-sm font-semibold text-gray-400">{t.pricing}</h2>
                    <p className="text-sm text-gray-300">{billingCopy.price}</p>
                </div>

                <div className="space-y-2">
                    <button
                        onClick={handleCheckout}
                        className="w-full rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white transition duration-300 hover:bg-indigo-700"
                    >
                        {billingCopy.cta}
                    </button>
                    <button
                        type="button"
                        className="w-full rounded-md border border-gray-700 px-4 py-2 text-sm text-gray-300 transition hover:border-gray-500 hover:text-white"
                        aria-label={t.cancelHint}
                    >
                        {t.cancel}
                    </button>
                    <p className="text-center text-xs text-gray-500">{t.cancelHint}</p>
                </div>
            </div>
        </div>
    );
};

export default PremiumFeatures;
