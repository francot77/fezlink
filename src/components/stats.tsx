'use client'
import useLinks from "@/hooks/useLinks";
import { useEffect, useState } from "react";
import Metrics from "./metrics";

const Stats = () => {
    const [selectedLink, setSelectedLink] = useState<string>("")

    const { links } = useLinks()
    useEffect(() => {
        if (links.length > 0) setSelectedLink(links[0].id)
    }, [links])
    return <div className="space-y-2">
        <h1>Links</h1>
        <div className="flex flex-row gap-2">
            {links && links.map(link => {
                return <button className="border-2 border-blue-500 p-2 rounded-md" onClick={() => setSelectedLink(link.id)} key={link.id}>{link.originalUrl}</button>
            })}
        </div>
        {selectedLink != "" ? <Metrics linkId={selectedLink} /> : null}
    </div>

}


export default Stats;