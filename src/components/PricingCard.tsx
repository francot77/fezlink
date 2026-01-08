/* eslint-disable no-unused-vars */
import { Tooltip } from '@/shared/ui';
import { Check, Flame, HelpCircle, X } from 'lucide-react';

export interface PricingFeature {
  label: string;
  included: boolean;
  tooltip?: string;
}

export interface PricingPlan {
  id: string; // 'free', 'starter', 'pro'
  name: string;
  description: string;
  price: string;
  period: string; // '/month' or '/year'
  features: PricingFeature[];
  buttonText: string;
  highlighted?: boolean;
  priceId?: string; // Paddle price ID
  badge?: string;
}

export interface PricingCardProps {
  plan: PricingPlan;
  currentPlan?: string;
  onSelect: (priceId: string) => void;
  loading?: boolean;
}

export const PricingCard = ({ plan, currentPlan, onSelect, loading }: PricingCardProps) => {
  const isCurrent = currentPlan === plan.id;
  const isFree = plan.id === 'free';
  const isPro = plan.id === 'pro';

  // Lógica simple de jerarquía: free < starter < pro
  const planOrder = { free: 0, starter: 1, pro: 2 };
  // @ts-expect-error isUpgradeERROR
  const isUpgrade = planOrder[plan.id] > planOrder[currentPlan || 'free'];
  // @ts-expect-error isDowngradERROR
  const isDowngrade = planOrder[plan.id] < planOrder[currentPlan || 'free'];

  // Definir estilos dinámicos basados en el plan
  let gradientClass = 'bg-black border border-white/10 hover:border-white/20';
  let badgeClass = '';
  let buttonClass = 'bg-white text-black hover:bg-gray-200';

  if (plan.highlighted) {
    if (isPro) {
      gradientClass = 'bg-gradient-to-b from-gray-900 via-gray-900 to-black border border-red-500/30 shadow-2xl shadow-red-900/20 md:scale-[1.05] z-10';
      badgeClass = 'border-red-500/40 bg-red-950/80 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
      buttonClass = 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-500 hover:to-orange-500 shadow-lg shadow-red-600/20 hover:shadow-red-600/40';
    } else {
      gradientClass = 'bg-gradient-to-b from-gray-900 via-gray-900 to-black border border-blue-500/30 shadow-2xl shadow-blue-900/20 md:scale-[1.05] z-10';
      badgeClass = 'border-blue-500/40 bg-blue-950/80 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.5)]';
      buttonClass = 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40';
    }
  }

  return (
    <div
      className={`
        relative flex flex-col rounded-2xl p-6 transition-all duration-300 h-full
        ${gradientClass}
      `}
    >
      {/* Background Glow Effect for Highlighted Plan */}
      {plan.highlighted && (
        <div className={`absolute inset-0 rounded-2xl pointer-events-none ${isPro ? 'bg-red-500/5' : 'bg-blue-500/5'}`} />
      )}

      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold backdrop-blur-md uppercase tracking-wider ${badgeClass}`}>
            {isPro && <Flame size={12} className="text-orange-400 fill-orange-400 animate-pulse shrink-0" />}
            {plan.badge}
          </span>
        </div>
      )}

      <div className="mb-6 text-center relative z-10">
        <h3 className={`text-xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-200'}`}>{plan.name}</h3>
        <p className="mt-2 text-sm text-gray-400 min-h-[40px] leading-relaxed">{plan.description}</p>
      </div>

      <div className="mb-8 flex flex-col items-center justify-center gap-1 relative z-10">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white tracking-tight">{plan.price}</span>
          <span className="text-sm text-gray-500 font-medium">{plan.period}</span>
        </div>
        {plan.period === '/month' && (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xs text-gray-500">
              Billed {plan.price === '$3.99' || plan.price === '$7.99' ? 'monthly' : 'annually'}
            </span>
            {(plan.price === '$3.20' || plan.price === '$6.40') && (
              <span className="text-xs font-medium text-emerald-400">
                {plan.price === '$3.20' ? '$38.40' : '$76.80'} billed yearly
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mb-8 flex-1 space-y-4 relative z-10 min-h-[280px]">
        {plan.features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3 text-sm group">
            <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${feature.included
              ? isPro
                ? 'bg-red-500/10 text-red-400 group-hover:bg-red-500/20 group-hover:text-red-300'
                : 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300'
              : 'bg-gray-800/50 text-gray-600'
              }`}>
              {feature.included ? <Check size={12} strokeWidth={3} /> : <X size={12} />}
            </div>
            <div className="flex flex-1 items-center gap-1.5">
              <span className={feature.included ? 'text-gray-300 font-medium' : 'text-gray-600 line-through'}>
                {feature.label}
              </span>
              {feature.tooltip && (
                <Tooltip content={feature.tooltip} position="top">
                  <HelpCircle size={14} className="text-gray-600 hover:text-gray-400 cursor-help transition-colors" />
                </Tooltip>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto relative z-10">
        <button
          onClick={() => !isCurrent && plan.priceId && onSelect(plan.priceId)}
          disabled={isCurrent || loading || isFree}
          className={`
            w-full rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 transform active:scale-[0.98]
            ${isCurrent
              ? 'bg-gray-900 text-gray-500 cursor-default border border-gray-800'
              : buttonClass
            }
            ${loading ? 'opacity-70 cursor-wait' : ''}
            ${isFree && !isCurrent ? 'hidden' : ''}
          `}
        >
          {loading ? 'Processing...' : isCurrent ? 'Current Plan' : isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : plan.buttonText}
        </button>

        {isDowngrade && !isCurrent && !isFree && (
          <div className="mt-3 flex items-start justify-center gap-1.5 text-xs text-gray-500 px-2">
            <HelpCircle size={14} className="shrink-0 mt-0.5" />
            <span className="text-center leading-snug">
              No refund. New price applies next billing cycle.
            </span>
          </div>
        )}

        {isFree && !isCurrent && (
          <button disabled className="w-full rounded-xl px-4 py-3 text-sm font-bold bg-gray-900 text-gray-500 cursor-default border border-gray-800">
            Free Forever
          </button>
        )}
      </div>
    </div>
  );
};
