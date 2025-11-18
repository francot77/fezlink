'use client';
import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Compass } from 'lucide-react';
import useLinks, { Link } from '@/hooks/useLinks';
import Metrics from './metrics';

interface StatsProps {
    links?: Link[];
}

const Stats = ({ links: providedLinks }: StatsProps) => {
    const linkStore = useLinks({ autoLoad: !providedLinks });
    const links = useMemo(() => providedLinks ?? linkStore.links, [providedLinks, linkStore.links]);
    const [selectedLink, setSelectedLink] = useState<string>('');

    useEffect(() => {
        if (links.length > 0) setSelectedLink(links[0].id);
    }, [links]);

    const selected = links.find((link) => link.id === selectedLink);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-xl border border-gray-700 bg-gray-900/60 p-4 shadow-lg md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20 text-blue-300">
                        <BarChart3 />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Analiza el rendimiento</p>
                        <h2 className="text-xl font-semibold text-white">Métricas por link</h2>
                    </div>
                </div>
                {selected && (
                    <div className="rounded-full bg-gray-800 px-4 py-2 text-sm text-gray-300">
                        Viendo: <span className="font-semibold text-white">{selected.originalUrl}</span>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <p className="text-sm font-medium text-gray-200">Selecciona un link</p>
                <div className="flex flex-wrap gap-2">
                    {links.map((link) => (
                        <button
                            key={link.id}
                            onClick={() => setSelectedLink(link.id)}
                            className={`rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                selectedLink === link.id
                                    ? 'border-blue-500 bg-blue-500/20 text-white'
                                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
                            }`}
                        >
                            {link.originalUrl}
                        </button>
                    ))}
                    {links.length === 0 && (
                        <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-700 bg-gray-800/60 px-4 py-3 text-sm text-gray-400">
                            <Compass size={16} /> Aún no hay links para mostrar métricas.
                        </div>
                    )}
                </div>
            </div>

            {selectedLink && <Metrics linkId={selectedLink} />}
        </div>
    );
};

export default Stats;
