/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

type CountryStat = {
    country: string;
    clicksCount: number;
};

type PointData = {
    lat: number;
    lng: number;
    size: number;
    color: string;
};

/* 🔥 Heatmap color interpolation (cold → hot) */
function heatColor(t: number) {
    t = Math.max(0, Math.min(1, t));

    // verde → amarillo → rojo
    if (t < 0.5) {
        // green → yellow
        const p = t / 0.5;
        const r = Math.round(255 * p);
        const g = 255;
        const b = 80;
        return `rgba(${r}, ${g}, ${b},0.75)`;
    } else {
        // yellow → red
        const p = (t - 0.5) / 0.5;
        const r = 255;
        const g = Math.round(255 * (1 - p));
        const b = 50;
        return `rgba(${r}, ${g}, ${b},0.55)`;
    }
}


export default function ClicksGlobe({
    countries,
}: {
    countries: CountryStat[];
}) {
    const [pointsData, setPointsData] = useState<PointData[]>([]);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [animate, setAnimate] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const globeEl = useRef<any>(null);

    /* ---------------- resize handling ---------------- */
    function scaleHeight(clicks: number) {
        const h = Math.sqrt(clicks) * 0.015;
        return animate ? h * 0.6 : h;
    }

    useEffect(() => {
        const t = setTimeout(() => setAnimate(false), 1200);
        return () => clearTimeout(t);
    }, []);
    useLayoutEffect(() => {
        const updateSize = () => {
            const el = containerRef.current;
            if (!el) return;
            setDimensions({ width: el.clientWidth, height: el.clientHeight });
        };

        updateSize();

        const observer = new ResizeObserver(updateSize);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, []);

    /* ---------------- globe setup ---------------- */

    useLayoutEffect(() => {
        const interval = setInterval(() => {
            if (globeEl.current) {
                globeEl.current.controls().autoRotate = true;
                globeEl.current.controls().autoRotateSpeed = 1;
                globeEl.current.pointOfView({ altitude: 2 }, 1000);
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    /* ---------------- data mapping ---------------- */

    useEffect(() => {
        const countryCoords: Record<string, [number, number]> = {
            AG: [17.05, -61.8],
            BT: [27.5, 90.5],
            IT: [42.83333333, 12.83333333],
            TV: [-8.0, 178.0],
            AI: [18.25, -63.16666666],
            AU: [-27.0, 133.0],
            BZ: [17.25, -88.75],
            VU: [-16.0, 167.0],
            BY: [53.0, 28.0],
            MU: [-20.28333333, 57.55],
            LA: [18.0, 105.0],
            SN: [14.0, -14.0],
            TR: [39.0, 35.0],
            BO: [-17.0, -65.0],
            LK: [7.0, 81.0],
            NF: [-29.03333333, 167.95],
            CN: [35.0, 105.0],
            BQ: [12.18, -68.25],
            GG: [49.46666666, -2.58333333],
            SD: [15.0, 30.0],
            YT: [-12.83333333, 45.16666666],
            BL: [18.5, -63.41666666],
            VA: [41.9, 12.45],
            TC: [21.75, -71.58333333],
            CW: [12.116667, -68.933333],
            BW: [-22.0, 24.0],
            BJ: [9.5, 2.25],
            LT: [56.0, 24.0],
            MS: [16.75, -62.2],
            VG: [18.431383, -64.62305],
            BI: [-3.5, 30.0],
            IE: [53.0, -8.0],
            SB: [-8.0, 159.0],
            BM: [32.33333333, -64.75],
            FI: [64.0, 26.0],
            PE: [-10.0, -76.0],
            BD: [24.0, 90.0],
            DK: [56.0, 10.0],
            DO: [19.0, -70.66666666],
            MD: [47.0, 29.0],
            BG: [43.0, 25.0],
            CR: [10.0, -84.0],
            NA: [-22.0, 17.0],
            LU: [49.75, 6.16666666],
            RU: [60.0, 100.0],
            AE: [24.0, 54.0],
            BS: [25.0343, -77.3963],
            JP: [36.0, 138.0],
            NG: [10.0, 8.0],
            GH: [8.0, -2.0],
            SL: [8.5, -11.5],
            AL: [41.0, 20.0],
            BE: [50.83333333, 4.0],
            ZM: [-15.0, 30.0],
            MG: [-20.0, 47.0],
            KR: [37.0, 127.5],
            ET: [8.0, 38.0],
            MN: [46.0, 105.0],
            SK: [48.66666666, 19.5],
            CU: [21.5, -80.0],
            GT: [15.5, -90.25],
            NO: [62.0, 10.0],
            CL: [-30.0, -71.0],
            CO: [4.0, -72.0],
            SA: [25.0, 45.0],
            IL: [31.47, 35.13],
            DE: [51.0, 9.0],
            NZ: [-41.0, 174.0],
            SE: [62.0, 15.0],
            ES: [40.0, -4.0],
            IN: [20.0, 77.0],
            GB: [54.0, -2.0],
            CA: [60.0, -95.0],
            MX: [23.0, -102.0],
            US: [38.0, -97.0],
            AR: [-34.0, -64.0],
            BR: [-10.0, -55.0],
            UY: [-33.0, -56.0],
            VE: [8.0, -66.0],
            ZA: [-29.0, 24.0],
            ZW: [-20.0, 30.0],

            UNKNOWN: [0, 0],
        };


        if (countries.length === 0) {
            setPointsData([]);
            return;
        }

        const values = countries.map(c => c.clicksCount);
        const max = Math.max(...values);
        const min = Math.min(...values);

        const mapped: PointData[] = countries
            .filter(c => countryCoords[c.country])
            .map(c => {
                const [lat, lng] = countryCoords[c.country];
                const t = max === min ? 1 : (c.clicksCount - min) / (max - min);

                return {
                    lat,
                    lng,
                    size: c.clicksCount,
                    color: heatColor(t),
                };
            });

        setPointsData(mapped);
    }, [countries]);

    /* ---------------- render ---------------- */

    return (
        <div
            ref={containerRef}
            className="flex h-full min-h-[260px] w-full items-center justify-center overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 shadow-inner"
        >
            <Globe
                ref={globeEl}
                width={dimensions.width}
                height={dimensions.height}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"

                backgroundColor="rgba(0,0,0,0)"
                pointsData={pointsData}
                pointLat={(d: any) => d.lat}
                pointLng={(d: any) => d.lng}
                pointAltitude={(d: any) => scaleHeight(d.size)}
                pointColor={(d: any) => d.color}
                pointsTransitionDuration={2000}
                pointRadius={0.5}
                pointResolution={12}
            />
        </div>
    );
}
