/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

export default function ClicksGlobe({
    countries,
}: {
    countries: { country: string; clicksCount: number }[];
}) {
    type PointData = { lat: number; lng: number; size: number };
    const [arcsData, setArcsData] = useState<PointData[]>([]);
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
            AF: [33.9391, 67.7100],
            AL: [41.1533, 20.1683],
            AO: [-11.2027, 17.8739],
            AR: [-38.4161, -63.6167],
            AM: [40.0691, 45.0382],
            AU: [-25.2744, 133.7751],
            AT: [47.5162, 14.5501],
            AZ: [40.1431, 47.5769],
            BD: [23.6850, 90.3563],
            BE: [50.5039, 4.4699],
            BF: [12.2383, -1.5616],
            BG: [42.7339, 25.4858],
            BI: [-3.3731, 29.9189],
            BJ: [9.3077, 2.3158],
            BO: [-16.2902, -63.5887],
            BR: [-14.2350, -51.9253],
            BW: [-22.3285, 24.6849],
            BY: [53.7098, 27.9534],
            CA: [56.1304, -106.3468],
            CD: [-4.0383, 21.7587],
            CF: [6.6111, 20.9394],
            CH: [46.8182, 8.2275],
            CL: [-35.6751, -71.5430],
            CN: [35.8617, 104.1954],
            CO: [4.5709, -74.2973],
            CR: [9.7489, -83.7534],
            CU: [21.5218, -77.7812],
            CZ: [49.8175, 15.4730],
            DE: [51.1657, 10.4515],
            DK: [56.2639, 9.5018],
            DO: [18.7357, -70.1627],
            DZ: [28.0339, 1.6596],
            EC: [-1.8312, -78.1834],
            EE: [58.5953, 25.0136],
            EG: [26.8206, 30.8025],
            ES: [40.4637, -3.7492],
            FI: [61.9241, 25.7482],
            FR: [46.6034, 1.8883],
            GB: [55.3781, -3.4360],
            GE: [42.3154, 43.3569],
            GH: [7.9465, -1.0232],
            GL: [71.7069, -42.6043],
            GN: [9.9456, -9.6966],
            GQ: [1.6508, 10.2679],
            GR: [39.0742, 21.8243],
            GT: [15.7835, -90.2308],
            HN: [13.7942, -88.8965],
            HR: [45.1000, 15.2000],
            HT: [18.9712, -72.2852],
            HU: [47.1625, 19.5033],
            ID: [-0.7893, 113.9213],
            IE: [53.4129, -8.2439],
            IL: [31.0461, 34.8516],
            IN: [20.5937, 78.9629],
            IQ: [33.2232, 43.6793],
            IR: [32.4279, 53.6880],
            IS: [64.9631, -19.0208],
            IT: [41.8719, 12.5674],
            JM: [18.1096, -77.2975],
            JO: [30.5852, 36.2384],
            JP: [36.2048, 138.2529],
            KE: [-0.0236, 37.9062],
            KG: [41.2044, 74.7661],
            KH: [12.5657, 104.9910],
            KP: [40.3399, 127.5101],
            KR: [35.9078, 127.7669],
            KW: [29.3117, 47.4818],
            KZ: [48.0196, 66.9237],
            LA: [19.8563, 102.4955],
            LB: [33.8547, 35.8623],
            LK: [7.8731, 80.7718],
            LR: [6.4281, -9.4295],
            LS: [-29.6099, 28.2336],
            LT: [55.1694, 23.8813],
            LU: [49.8153, 6.1296],
            LV: [56.8796, 24.6032],
            LY: [26.3351, 17.2283],
            MA: [31.7917, -7.0926],
            MD: [47.4116, 28.3699],
            ME: [42.7087, 19.3744],
            MG: [-18.7669, 46.8691],
            MK: [41.6086, 21.7453],
            ML: [17.5707, -3.9962],
            MM: [21.9162, 95.9560],
            MN: [46.8625, 103.8467],
            MR: [21.0079, -10.9408],
            MT: [35.9375, 14.3754],
            MX: [23.6345, -102.5528],
            MY: [4.2105, 101.9758],
            MZ: [-18.6657, 35.5296],
            NA: [-22.9576, 18.4904],
            NE: [17.6078, 8.0817],
            NG: [9.0820, 8.6753],
            NI: [12.8654, -85.2072],
            NL: [52.1326, 5.2913],
            NO: [60.4720, 8.4689],
            NP: [28.3949, 84.1240],
            NZ: [-40.9006, 174.8860],
            OM: [21.5126, 55.9233],
            PA: [8.5380, -80.7821],
            PE: [-9.1900, -75.0152],
            PG: [-6.3149, 143.9555],
            PH: [12.8797, 121.7740],
            PK: [30.3753, 69.3451],
            PL: [51.9194, 19.1451],
            PT: [39.3999, -8.2245],
            PY: [-23.4425, -58.4438],
            QA: [25.3548, 51.1839],
            RO: [45.9432, 24.9668],
            RS: [44.0165, 21.0059],
            RU: [61.5240, 105.3188],
            RW: [-1.9403, 29.8739],
            SA: [23.8859, 45.0792],
            SD: [12.8628, 30.2176],
            SE: [60.1282, 18.6435],
            SG: [1.3521, 103.8198],
            SI: [46.1512, 14.9955],
            SK: [48.6690, 19.6990],
            SL: [8.4606, -11.7799],
            SN: [14.4974, -14.4524],
            SO: [5.1521, 46.1996],
            SR: [3.9193, -56.0278],
            SV: [13.7942, -88.8965],
            SY: [34.8021, 38.9968],
            SZ: [-26.5225, 31.4659],
            TD: [15.4542, 18.7322],
            TG: [8.6195, 0.8248],
            TH: [15.8700, 100.9925],
            TJ: [38.8610, 71.2761],
            TL: [-8.8742, 125.7275],
            TN: [33.8869, 9.5375],
            TR: [38.9637, 35.2433],
            TT: [10.6918, -61.2225],
            TW: [23.6978, 120.9605],
            TZ: [-6.3690, 34.8888],
            UA: [48.3794, 31.1656],
            UG: [1.3733, 32.2903],
            US: [37.0902, -95.7129],
            UY: [-32.5228, -55.7658],
            UZ: [41.3775, 64.5853],
            VE: [6.4238, -66.5897],
            VN: [14.0583, 108.2772],
            YE: [15.5527, 48.5164],
            ZA: [-30.5595, 22.9375],
            ZM: [-13.1339, 27.8493],
            ZW: [-19.0154, 29.1549],
            UNKNOWN: [0, 0], // fallback
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
        <div className="flex h-full min-h-[260px] w-full items-center justify-center overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 shadow-inner">
            <Globe
                ref={globeEl}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                backgroundColor="rgba(0,0,0,0)"
                pointsData={arcsData}
                pointLat={(d: any) => d.lat}
                pointLng={(d: any) => d.lng}
                pointAltitude={(d: any) => d.size * 0.001}
                pointColor={() => '#b3f96d'}
                pointRadius={0.3}
                pointResolution={12}
            />
        </div>
    );
}
