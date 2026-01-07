'use client';

import { FreeFeatures } from '@/components/Freefeatures';
import NavBar from '@/components/navbar';
import PremiumFeatures from '@/components/premiumfeatures';

const Pricing = () => {
  return (
    <div className="flex justify-center items-center h-screen w-full text-white gap-4">
      <NavBar />
      <FreeFeatures />
      <PremiumFeatures time={'mensual'} priceId={'pri_01jwryd6rgxfdh50rknhcqh1aq'} />
      <PremiumFeatures time={'anual'} priceId={'pri_01jwryfkyzp3jrbj7xw8hjp585'} />
    </div>
  );
};

export default Pricing;
