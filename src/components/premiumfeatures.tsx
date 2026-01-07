import { usePaddle } from '@/hooks/usePaddle';
import { redirect } from 'next/navigation';
import { SupportedLanguage } from '@/types/i18n';
import { useAuth } from '@/hooks/useAuth';
const translations: Record<SupportedLanguage, { [key: string]: string }> = {
  en: {
    title: 'Manage subscription',
    subtitle: 'Keep your premium perks active and view your current plan.',
    benefits: 'Included benefits',
    customSlug: 'Custom slug',
    unlimited: 'Unlimited links',
    support: 'Priority support',
    dashboard: 'Analytics dashboard',
    adfree: 'Ad-free experience',
    pricing: 'Plan details',
    monthly: 'Monthly billing',
    annual: 'Annual billing',
    upgradeMonthly: 'Manage monthly plan',
    upgradeAnnual: 'Manage annual plan',
    perMonth: '$2.5/month',
    perMonthAnnual: '$2/month',
    cancel: 'Cancel subscription',
    currentPlan: 'Current plan',
  },
  es: {
    title: 'Administrar suscripción',
    subtitle: 'Mantén activos tus beneficios premium y revisa tu plan actual.',
    benefits: 'Beneficios incluidos',
    customSlug: 'Slug personalizado',
    unlimited: 'Links ilimitados',
    support: 'Soporte prioritario',
    dashboard: 'Panel de analíticas',
    adfree: 'Experiencia sin anuncios',
    pricing: 'Detalle del plan',
    monthly: 'Facturación mensual',
    annual: 'Facturación anual',
    upgradeMonthly: 'Gestionar plan mensual',
    upgradeAnnual: 'Gestionar plan anual',
    perMonth: '$2.5/mes',
    perMonthAnnual: '$2/mes',
    cancel: 'Cancelar suscripción',
    currentPlan: 'Plan actual',
  },
};

const PremiumFeatures = ({
  priceId,
  time,
  language = 'en',
}: {
  priceId: string;
  time: string;
  language?: SupportedLanguage;
}) => {
  const t = translations[language];
  const auth = useAuth();
  const paddle = usePaddle();
  const handleCheckout = () => {
    if (!auth.userId) redirect('/');
    if (!paddle) return;
    paddle.Checkout.open({
      items: [{ priceId: priceId, quantity: 1 }],
      customer: {
        email: 'user@example.com',
      },
    });
  };

  const planLabel = time === 'anual' ? t.annual : t.monthly;

  return (
    <div className="grid place-items-center min-h-[50vh]">
      <div className="m-auto w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900/70 p-6 shadow-2xl shadow-blue-900/20">
        <header className="mb-4 space-y-1">
          <p className="text-sm text-gray-400 uppercase tracking-wide">{t.currentPlan}</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white">{t.title}</h1>
              <p className="text-sm text-gray-400">{t.subtitle}</p>
            </div>
            <span className="rounded-full border border-blue-500/50 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-100">
              {planLabel}
            </span>
          </div>
        </header>

        <div className="grid gap-4 rounded-xl border border-gray-800/70 bg-gray-900/80 p-4 sm:grid-cols-2">
          <div>
            <h2 className="mb-3 text-sm font-semibold text-gray-300">{t.benefits}</h2>
            <ul className="space-y-2 text-sm text-gray-200">
              {[t.customSlug, t.unlimited, t.support, t.dashboard, t.adfree].map((label) => (
                <li key={label} className="flex items-center gap-2">
                  <span className="text-green-400">✔</span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-950/40 p-4">
            <h3 className="text-sm font-semibold text-gray-300">{t.pricing}</h3>
            <p className="mt-1 text-lg font-bold text-white">
              {time === 'anual' ? t.perMonthAnnual : t.perMonth}
            </p>
            <p className="text-xs text-gray-400">{planLabel}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            onClick={handleCheckout}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700"
          >
            {time == 'mensual' ? t.upgradeMonthly : t.upgradeAnnual}
          </button>
          <button
            type="button"
            className="w-full rounded-md border border-red-500/50 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/10"
            aria-label={t.cancel}
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeatures;
