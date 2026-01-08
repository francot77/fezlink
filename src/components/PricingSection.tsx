import { useState } from 'react';
import { usePaddle } from '@/hooks/usePaddle';
import { useSubscription } from '@/hooks/useSubscription';
import { PricingCard, PricingPlan } from './PricingCard';
import { useAuth } from '@/hooks/useAuth';
import { redirect, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface PricingSectionProps {
  showManageActions?: boolean; // Prop para diferenciar Dashboard vs Public
}

export const PricingSection = ({ showManageActions = false }: PricingSectionProps) => {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const { accountType, isLoading: subLoading } = useSubscription();
  const { userId } = useAuth();
  const { data: session } = useSession(); // Para obtener el email real
  const paddle = usePaddle();
  const router = useRouter();

  const handleCheckout = (priceId: string, planId: string) => {
    if (!userId) {
      router.push('/login');
      return;
    }

    // Lógica para detectar Downgrade
    const planOrder = { free: 0, starter: 1, pro: 2 };
    // @ts-ignore
    const currentOrder = planOrder[accountType || 'free'];
    // @ts-ignore
    const newOrder = planOrder[planId];

    const isDowngrade = newOrder < currentOrder;

    if (showManageActions && isDowngrade) {
      // Flujo de Downgrade: No abrir checkout, sino confirmar cambio de plan para el siguiente ciclo
      if (confirm('Are you sure you want to downgrade? This change will take effect at the end of your current billing cycle. No immediate refund will be issued.')) {
        console.log('Processing downgrade to:', planId);
        // Aquí llamarías a tu API backend: /api/subscription/downgrade
        // await fetch('/api/subscription/update', { 
        //   method: 'POST', 
        //   body: JSON.stringify({ priceId, action: 'downgrade' }) 
        // });
        alert('Plan change scheduled for the next billing cycle.');
      }
      return;
    }

    if (!paddle) return;

    paddle.Checkout.open({
      items: [{ priceId: priceId, quantity: 1 }],
      customer: {
        email: session?.user?.email || '', // Usar email real de la sesión
      },
      customData: {
        userId: userId, // CRÍTICO: Para identificar al usuario en el webhook
      },
    });
  };

  const handleCancelSubscription = async () => {
    // Aquí iría la lógica real de cancelación (llamada a tu API backend -> Paddle API)
    // Por ahora, solo un alert o log
    if (confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      console.log('Cancelling subscription...');
      // await fetch('/api/subscription/cancel', { method: 'POST' });
      // toast.success('Subscription canceled');
    }
  }

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for trying out the platform.',
      price: '$0',
      period: '/forever',
      buttonText: userId ? 'Current Plan' : 'Get Started',
      features: [
        { label: 'Unlimited links (max 2)', included: false, tooltip: 'Limited to 2 active links' },
        { label: 'Basic Analytics (7 days)', included: true, tooltip: 'Access to last 7 days of click data' },
        { label: 'Custom slug', included: false },
        { label: 'Ad-free experience', included: true },
        { label: 'Priority Support', included: false },
        { label: 'Full Customization BioPage', included: false },
      ],
    },
    {
      id: 'starter',
      name: 'Starter',
      description: 'Great for personal projects.',
      price: billingInterval === 'monthly' ? '$3.99' : '$3.20',
      period: '/month',
      buttonText: 'Start Trial',
      highlighted: true,
      badge: 'Most Popular',
      priceId: billingInterval === 'monthly' ? 'pri_01kefrnn3x4zexm6jwhkf5rszv' : 'pri_01kefrpvn1s48jfdwndjc0ppnw', // IDs reales de Starter
      features: [
        { label: 'Unlimited links', included: true },
        { label: 'Full Analytics History', included: true, tooltip: 'Access complete historical data' },
        { label: 'Custom slug', included: true },
        { label: 'Ad-free experience', included: true },
        { label: 'Basic Support', included: true },
        { label: 'Full Customization BioPage', included: true, tooltip: 'Customize backgrounds, gradients, and layouts' },
        { label: 'Advanced Insights', included: false },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For power users and businesses.',
      price: billingInterval === 'monthly' ? '$7.99' : '$6.40', // Precios ejemplo
      period: '/month',
      buttonText: 'Go Pro',
      highlighted: true,
      badge: 'Hot Deal',
      priceId: billingInterval === 'monthly' ? 'pri_01jwryd6rgxfdh50rknhcqh1aq' : 'pri_01jwryfkyzp3jrbj7xw8hjp585', // IDs reales de Pro
      features: [
        { label: 'Unlimited links', included: true },
        { label: 'Full Analytics History', included: true },
        { label: 'Custom slug', included: true },
        { label: 'Ad-free experience', included: true },
        { label: 'Priority Support', included: true },
        { label: 'Full Customization BioPage', included: true },
        { label: 'Advanced Insights', included: true, tooltip: 'Deep dive into user behavior' },
      ],
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-4xl font-bold text-white sm:text-5xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Simple, transparent pricing
        </h2>
        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
          Choose the perfect plan for your needs. Always know what you'll pay.
        </p>

        {/* Billing Toggle */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <span className={`text-sm font-medium transition-colors ${billingInterval === 'monthly' ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
          <button
            onClick={() => setBillingInterval(prev => prev === 'monthly' ? 'annual' : 'monthly')}
            className="relative h-7 w-12 rounded-full bg-gray-800 transition-colors hover:bg-gray-700 ring-1 ring-white/10"
            role="switch"
            aria-checked={billingInterval === 'annual'}
          >
            <div
              className={`absolute top-1 h-5 w-5 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 shadow-lg transition-all duration-300 ${billingInterval === 'annual' ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${billingInterval === 'annual' ? 'text-white' : 'text-gray-400'}`}>
            Annual <span className="text-emerald-400 text-xs font-bold ml-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">SAVE 20%</span>
          </span>
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid gap-8 md:grid-cols-3 lg:gap-8 max-w-6xl mx-auto">
        {plans.map((plan, idx) => (
          <div
            key={plan.id}
            className="animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col"
            style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'backwards' }}
          >
            <PricingCard
              plan={plan}
              currentPlan={userId ? accountType : ''}
              onSelect={(priceId) => handleCheckout(priceId, plan.id)}
              loading={subLoading}
            />
          </div>
        ))}
      </div>

      {/* Mobile Carousel */}
      <div className="md:hidden relative w-full overflow-x-auto snap-x snap-mandatory py-12 scrollbar-hide">
        <div className="flex gap-4 px-4 w-max">
          {plans.map((plan, idx) => (
            <div
              key={plan.id}
              className="w-[85vw] max-w-[320px] snap-center pt-4"
            >
              <PricingCard
                plan={plan}
                currentPlan={userId ? accountType : ''}
                onSelect={(priceId) => handleCheckout(priceId, plan.id)}
                loading={subLoading}
              />
            </div>
          ))}
        </div>

        {/* Scroll Indicators (Hint) */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2">
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <ChevronLeft size={14} />
            <span>Swipe for more plans</span>
            <ChevronRight size={14} />
          </div>
        </div>
      </div>
      {/* Botón de Cancelar Suscripción (Solo Dashboard y si no es Free) */}
      {showManageActions && accountType !== 'free' && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleCancelSubscription}
            className="text-sm text-red-400 hover:text-red-300 hover:underline transition-colors flex items-center gap-2"
          >
            Cancel Subscription
          </button>
        </div>
      )}
    </div>
  );
};
