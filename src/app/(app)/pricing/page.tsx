'use client';

import NavBar from '@/components/navbar';
import { PricingSection } from '@/components/PricingSection';

const Pricing = () => {
  return (
    <div className="min-h-screen w-full bg-black text-white">
      <NavBar />
      <div className="pt-20">
        <PricingSection />
      </div>
    </div>
  );
};

export default Pricing;
