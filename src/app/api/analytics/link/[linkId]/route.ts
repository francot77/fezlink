/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AnalyticsDaily from '@/app/models/analyticsDaily';
import AnalyticsMonthly from '@/app/models/analyticsMonthly';
import { Link } from '@/app/models/links';

interface Trend {
    key: string;
    thisPeriod: number;
    lastPeriod: number;
    changePercent: number | null;
    hasEnoughData: boolean;
}

function sumMap(
    target: Record<string, number>,
    source?: Record<string, number>
) {
    if (!source) return;
    for (const [key, value] of Object.entries(source)) {
        target[key] = (target[key] ?? 0) + value;
    }
}

function buildTrends(
    currentRows: any[],
    previousRows: any[],
    field: 'byDevice' | 'bySource'
): Trend[] {
    const sum = (rows: any[]) => {
        const acc: Record<string, number> = {};
        for (const r of rows) {
            const data = r[field];
            const dataObj = data instanceof Map ? Object.fromEntries(data) : data || {};

            for (const [k, v] of Object.entries(dataObj)) {
                acc[k] = (acc[k] ?? 0) + (v as number);
            }
        }
        return acc;
    };

    const current = sum(currentRows);
    const previous = sum(previousRows);

    const keys = new Set([
        ...Object.keys(current),
        ...Object.keys(previous),
    ]);

    return [...keys].map((key) => {
        const thisPeriod = current[key] ?? 0;
        const lastPeriod = previous[key] ?? 0;

        const hasEnoughData = thisPeriod > 0 || lastPeriod > 0;

        let changePercent: number | null = null;
        if (lastPeriod > 0) {
            changePercent = Math.round(
                ((thisPeriod - lastPeriod) / lastPeriod) * 100
            );
        }

        return {
            key,
            thisPeriod,
            lastPeriod,
            changePercent,
            hasEnoughData,
        };
    });
}

// Helper para determinar si usar datos mensuales o diarios
function shouldUseMonthlyData(from: string, to: string): boolean {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffMs = toDate.getTime() - fromDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // Usar datos mensuales si el rango es mayor a 60 días
    return diffDays > 60;
}

// Helper para filtrar datos por dispositivo/fuente/país
function filterData(data: any[], filters: { device?: string; source?: string; country?: string }) {
    if (!filters.device && !filters.source && !filters.country) {
        return data;
    }

    return data.map(row => {
        const newRow = { ...row };

        // Filtrar byDevice si hay filtro de dispositivo
        if (filters.device && newRow.byDevice) {
            const deviceObj = newRow.byDevice instanceof Map ? Object.fromEntries(newRow.byDevice) : newRow.byDevice;
            const filteredDevice: Record<string, number> = {};

            if (deviceObj[filters.device]) {
                filteredDevice[filters.device] = deviceObj[filters.device];
            }
            newRow.byDevice = filteredDevice;
            // Ajustar totalClicks para reflejar solo el dispositivo filtrado
            newRow.totalClicks = filteredDevice[filters.device] || 0;
        }

        // Filtrar bySource si hay filtro de fuente
        if (filters.source && newRow.bySource) {
            const sourceObj = newRow.bySource instanceof Map ? Object.fromEntries(newRow.bySource) : newRow.bySource;
            const filteredSource: Record<string, number> = {};

            if (sourceObj[filters.source]) {
                filteredSource[filters.source] = sourceObj[filters.source];
            }
            newRow.bySource = filteredSource;
            // Ajustar totalClicks para reflejar solo la fuente filtrada
            if (!filters.device) { // Solo si no hay filtro de dispositivo
                newRow.totalClicks = filteredSource[filters.source] || 0;
            } else {
                // Si hay ambos filtros, usar el mínimo (para no duplicar)
                newRow.totalClicks = Math.min(
                    newRow.totalClicks,
                    filteredSource[filters.source] || 0
                );
            }
        }

        // Filtrar byCountry si hay filtro de país
        if (filters.country && newRow.byCountry) {
            const countryObj = newRow.byCountry instanceof Map ? Object.fromEntries(newRow.byCountry) : newRow.byCountry;
            const filteredCountry: Record<string, number> = {};

            if (countryObj[filters.country]) {
                filteredCountry[filters.country] = countryObj[filters.country];
            }
            newRow.byCountry = filteredCountry;
            // Ajustar totalClicks para reflejar solo el país filtrado
            if (!filters.device && !filters.source) {
                newRow.totalClicks = filteredCountry[filters.country] || 0;
            } else {
                // Si hay otros filtros, usar el mínimo
                const countryClicks = filteredCountry[filters.country] || 0;
                newRow.totalClicks = Math.min(newRow.totalClicks, countryClicks);
            }
        }

        return newRow;
    });
}

// Helper para obtener el período anterior
function getPreviousPeriod(from: string, to: string, useMonthly: boolean) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (useMonthly) {
        // Para datos mensuales, retroceder 1 mes
        const prevTo = new Date(fromDate);
        prevTo.setMonth(prevTo.getMonth() - 1);

        const prevFrom = new Date(prevTo);
        const diffMs = toDate.getTime() - fromDate.getTime();
        prevFrom.setTime(prevFrom.getTime() - diffMs);

        return {
            prevFrom: prevFrom.toISOString().slice(0, 10),
            prevTo: prevTo.toISOString().slice(0, 10)
        };
    } else {
        // Para datos diarios, retroceder la misma cantidad de días
        const diffMs = toDate.getTime() - fromDate.getTime();
        const prevTo = new Date(fromDate.getTime() - 1);
        const prevFrom = new Date(prevTo.getTime() - diffMs);

        return {
            prevFrom: prevFrom.toISOString().slice(0, 10),
            prevTo: prevTo.toISOString().slice(0, 10)
        };
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ linkId: string }> }
) {
    await dbConnect();

    const { linkId } = await params;
    const { searchParams } = new URL(req.url);

    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const device = searchParams.get('device');
    const source = searchParams.get('source');
    const country = searchParams.get('country');

    if (!from || !to) {
        return NextResponse.json(
            { error: 'from and to are required' },
            { status: 400 }
        );
    }

    // 1️⃣ totalClicks (fuente fuerte) - NO se filtra
    const link = await Link.findById(linkId).select('totalClicks');
    if (!link) {
        return NextResponse.json(
            { error: 'Link not found' },
            { status: 404 }
        );
    }

    // 2️⃣ Determinar qué modelo usar
    const useMonthly = shouldUseMonthlyData(from, to);
    const AnalyticsModel = useMonthly ? AnalyticsMonthly : AnalyticsDaily;
    const dateField = useMonthly ? 'month' : 'date';

    // 3️⃣ Formatear fechas para la consulta
    const formatForModel = (dateStr: string) => {
        const date = new Date(dateStr);
        if (useMonthly) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            return `${year}-${month}`;
        }
        return dateStr;
    };

    const formattedFrom = formatForModel(from);
    const formattedTo = formatForModel(to);

    // 4️⃣ Obtener datos del período actual
    const currentRows = await AnalyticsModel.find({
        linkId,
        [dateField]: { $gte: formattedFrom, $lte: formattedTo },
    }).lean();

    // 5️⃣ Aplicar filtros si existen
    const filters = {
        device: device || undefined,
        source: source || undefined,
        country: country || undefined,
    };

    const filteredCurrentRows = filterData(currentRows, filters);

    // 6️⃣ Obtener período anterior para trends
    const { prevFrom, prevTo } = getPreviousPeriod(from, to, useMonthly);
    const prevFormattedFrom = formatForModel(prevFrom);
    const prevFormattedTo = formatForModel(prevTo);

    const previousRows = await AnalyticsModel.find({
        linkId,
        [dateField]: { $gte: prevFormattedFrom, $lte: prevFormattedTo },
    }).lean();

    // Filtrar también el período anterior para comparación justa
    const filteredPreviousRows = filterData(previousRows, filters);

    // 7️⃣ Convertir Map a objetos para el frontend
    const convertMapToObject = (mapData: any) => {
        if (!mapData) return {};
        if (mapData instanceof Map) {
            return Object.fromEntries(mapData);
        }
        return mapData;
    };

    // 8️⃣ Procesar datos para respuesta
    const daily: { date: string; clicks: number }[] = [];
    const byCountry: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    const byDevice: Record<string, number> = {};

    for (const row of filteredCurrentRows) {
        // Solo agregar al gráfico si tiene datos después del filtrado
        const rowClicks = row.totalClicks ?? 0;
        if (rowClicks > 0 || !device && !source && !country) {
            daily.push({
                date: row[dateField],
                clicks: rowClicks,
            });
        }

        // Sumar estadísticas de los datos filtrados
        sumMap(byCountry, convertMapToObject(row.byCountry));
        sumMap(bySource, convertMapToObject(row.bySource));
        sumMap(byDevice, convertMapToObject(row.byDevice));
    }

    // Ordenar por fecha
    daily.sort((a, b) => a.date.localeCompare(b.date));

    // 9️⃣ Calcular trends con datos filtrados
    const deviceTrends = buildTrends(
        filteredCurrentRows,
        filteredPreviousRows,
        'byDevice'
    );

    const sourceTrends = buildTrends(
        filteredCurrentRows,
        filteredPreviousRows,
        'bySource'
    );

    return NextResponse.json({
        totalClicks: link.totalClicks ?? 0, // Total general, no filtrado
        daily,
        byCountry,
        bySource,
        byDevice,
        trends: {
            byDevice: deviceTrends,
            bySource: sourceTrends,
        },
        filters: {
            device,
            source,
            country,
        },
        metadata: {
            frequency: useMonthly ? 'monthly' : 'daily',
            dateField,
        }
    });
}