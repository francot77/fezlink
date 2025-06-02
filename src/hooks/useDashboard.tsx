import { useState } from "react";
import useLinks from "./useLinks";
import { useRouter } from "next/navigation";
import Profile from "@/app/dashboard/profile";
import BiopageEditor from "@/app/dashboard/biopageeditor";
import PremiumFeatures from "@/components/premiumfeatures";
import Stats from "@/components/stats";

// Íconos
import {
    User,
    Link,
    BarChart,
    Layout,
    Flame,
    Home,
} from "lucide-react";

export const useDashboard = () => {
    const [activeLink, setActiveLink] = useState<number | null>(0);
    const { renderLinks } = useLinks();
    const router = useRouter();

    const LINKS = [
        {
            index: 0,
            title: "Profile",
            icon: <User size={18} />,
            action: () => setActiveLink(0),
        },
        {
            index: 1,
            title: "Links",
            icon: <Link size={18} />,
            action: () => setActiveLink(1),
        },
        {
            index: 2,
            title: "Stats",
            icon: <BarChart size={18} />,
            action: () => setActiveLink(2),
        },
        {
            index: 3,
            title: "BioPage",
            icon: <Layout size={18} />,
            action: () => setActiveLink(3),
        },
        {
            index: 4,
            title: "Get Premium 🔥",
            icon: <Flame size={18} />,
            action: () => setActiveLink(4),
        },
        {
            index: 20,
            title: "Back Home",
            icon: <Home size={18} />,
            color: "text-blue-400",
            action: () => router.push("/"),
        },
    ];

    const renderButtons = () =>
        LINKS.map(({ index, title, icon, action, color }) => (
            <li key={index}>
                <button
                    onClick={action}
                    className={`flex items-center gap-2 w-full px-3 py-2 rounded-md transition-all ${activeLink === index ? "bg-blue-600 text-white" : "hover:bg-gray-700 text-gray-300"
                        } ${color ?? ""}`}
                >
                    <span>{icon}</span>
                    <span className="hidden md:inline">{title}</span>
                </button>
            </li>
        ));

    const renderSection = (index: number | null) => {
        switch (index) {
            case 0:
                return <Profile />;
            case 1:
                return renderLinks();
            case 2:
                return <Stats />;
            case 3:
                return <BiopageEditor />;
            case 4:
                return <div className="flex justify-center items-center gap-4">
                    <PremiumFeatures time={"mensual"} priceId={"pri_01jwryd6rgxfdh50rknhcqh1aq"} />
                    <PremiumFeatures time={"anual"} priceId={"pri_01jwryfkyzp3jrbj7xw8hjp585"} />
                </div>
            default:
                return <p>Welcome to your dashboard!</p>;
        }
    };

    return { activeLink, renderButtons, renderSection };
};
