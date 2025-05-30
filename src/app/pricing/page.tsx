'use client'

import { FreeFeatures } from "@/components/Freefeatures";
import NavBar from "@/components/navbar";
import { PremiumFeatures } from "@/components/premiumfeatures"

const Pricing = () => {
    return <div className="flex justify-center items-center h-screen w-full text-white gap-4"><NavBar /><FreeFeatures /><PremiumFeatures /></div>
}


export default Pricing;