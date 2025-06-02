import { usePaddle } from "@/hooks/usePaddle";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export const PremiumFeatures = () => {
    const auth = useAuth()
    const paddle = usePaddle()
    const handleCheckout = () => {
        if (!auth.userId) redirect("/")
        if (!paddle) return;

        paddle.Checkout.open({
            items: [{ priceId: 'pri_01jwryd6rgxfdh50rknhcqh1aq', quantity: 1 }],
            customer: {
                email: 'user@example.com',
            },
        });
    };

    return <div className="grid place-items-center min-h-[50vh]"><div className="max-w-sm m-auto bg-gray-800 dark:bg-gray-800 shadow-lg rounded-xl p-6 transition-transform transform hover:scale-105">
        <h1 className="text-2xl font-bold text-white mb-4">Premium Benefits</h1>

        <ul className="text-left space-y-2 mb-6">
            <li className="flex items-center gap-2">
                <span className="text-green-400">✔</span>
                <span className="text-gray-300">Custom slug</span>
            </li>
            <li className="flex items-center gap-2">
                <span className="text-green-400">✔</span>
                <span className="text-gray-300">Unlimited links</span>
            </li>
            <li className="flex items-center gap-2">
                <span className="text-green-400">✔</span>
                <span className="text-gray-300">Priority support</span>
            </li>
            <li className="flex items-center gap-2">
                <span className="text-green-400">✔</span>
                <span className="text-gray-300">Analytics dashboard</span>
            </li>
            <li className="flex items-center gap-2">
                <span className="text-green-400">✔</span>
                <span className="text-gray-300">Ad-free experience</span>
            </li>
        </ul>

        <div className="mb-6">
            <h2 className="font-semibold text-gray-400 mb-2">Pricing</h2>
            <p className="text-sm text-gray-500">$2/month - Billing Anual</p>
            <p className="text-sm text-gray-500">$2.5/month - Billing Mensual</p>
        </div>

        <button onClick={handleCheckout} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300">
            Upgrade to Premium
        </button>
    </div></div>
}