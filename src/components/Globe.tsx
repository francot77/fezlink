'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

export default function ClicksGlobe({
    countries,
}: {
    countries: { country: string; clicksCount: number }[];
}) {
    const [arcsData, setArcsData] = useState<any[]>([]);
    const globeEl = useRef<any>(null);

    // 🧠 Delay hasta que ref esté disponible
    useLayoutEffect(() => {
        const interval = setInterval(() => {
            if (globeEl.current) {
                globeEl.current.controls().autoRotate = true;
                globeEl.current.controls().autoRotateSpeed = 1;
                globeEl.current.pointOfView({ altitude: 8 }, 1000);
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const countryCoords: Record<string, [number, number]> = {
            AR: [-38.4161, -63.6167],
            UNKNOWN: [40.4637, -3.7492],
            // Otros países...
        };

        const data = countries
            .filter((c) => countryCoords[c.country])
            .map((c) => {
                const [lat, lng] = countryCoords[c.country];
                return {
                    lat,
                    lng,
                    size: c.clicksCount,
                };
            });

        setArcsData(data);
    }, [countries]);

    return (
        <div className="sm:w-[300px] md:w-[500px] h-[300px] flex justify-center items-center rounded-xl shadow-lg overflow-hidden">
            <Globe
                ref={globeEl}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                backgroundColor="rgba(0,0,0,0)"
                pointsData={arcsData}
                pointLat={(d) => d.lat}
                pointLng={(d) => d.lng}
                pointAltitude={(d) => d.size * 0.001}
                pointColor={() => '#b3f96d'}
                pointRadius={0.3}
                pointResolution={12}
            />
        </div>
    );
}
