import { useState } from "react";
import useLinks from "./useLinks";
import { useRouter } from "next/navigation";
import Profile from "@/app/dashboard/profile";
import BiopageEditor from "@/app/dashboard/biopageeditor";

export const useDashboard = () => {
    const [activeLink, setActiveLink] = useState<number | null>(null);
    const { renderLinks } = useLinks()
    const router = useRouter()
    const renderButtons = () => {
        const LINKS = [{
            index: 0,
            title: "Profile",
            function: () => setActiveLink(0)
        }, {
            index: 1,
            title: "Links",
            function: () => setActiveLink(1)
        }, {
            index: 2,
            title: "Stats",
            function: () => setActiveLink(2)
        }, {
            index: 3,
            title: "BioPage",
            function: () => setActiveLink(3)
        },
        {
            index: 20,
            title: "Back Home",
            color: "blue",
            function: () => { router.push("/") }
        }]
        return LINKS.map((e) => {
            return <li key={e.index}><button onClick={e.function} style={{ color: e.color ? e.color : "white", cursor: "pointer" }}>{e.title}</button></li>
        })
    }

    const renderSection = (index: number) => {
        switch (index) {
            case 0:
                return <Profile />
            case 1:
                return renderLinks()
            case 2:
                return <p>Mis Stats!</p>
            case 3:
                return <BiopageEditor />
            default:
                return <p>Welcome to your dashboard!</p>

        }
    }
    return { activeLink, renderButtons, renderSection }
}

