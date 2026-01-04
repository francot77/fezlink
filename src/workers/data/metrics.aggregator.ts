// worker/data/metrics.aggregator.ts
// Data layer: agregación pura de métricas desde MongoDB
// Sin lógica de negocio, solo pipelines eficientes


import type { AggregatedMetrics, InsightPeriod } from '../../types/insights.types';
import { Link } from '@/app/models/links';
import analyticsDaily from '@/app/models/analyticsDaily';
import { Types } from 'mongoose';
type LeanLink = {
    _id: Types.ObjectId;
    slug: string;
};
/**
 * Calcula las fechas de inicio/fin para un período
 */
function getPeriodDates(period: InsightPeriod): { startDate: string; endDate: string; previousStartDate: string } {
    const now = new Date();
    const endDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

    let daysBack: number;
    switch (period) {
        case '7d':
            daysBack = 7;
            break;
        case '30d':
            daysBack = 30;
            break;
        case '90d':
            daysBack = 90;
            break;
        case 'yearly':
            daysBack = 365;
            break;
    }

    const start = new Date(now);
    start.setDate(start.getDate() - daysBack);
    const startDate = start.toISOString().split('T')[0];

    // Previous period (mismo rango, desplazado)
    const previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - daysBack);
    const previousStartDate = previousStart.toISOString().split('T')[0];

    return { startDate, endDate, previousStartDate };
}

/**
 * Agrega métricas para un usuario en un período específico
 */
export async function aggregateMetricsForUser(
    userId: string,
    period: InsightPeriod
): Promise<AggregatedMetrics> {
    const { startDate, endDate, previousStartDate } = getPeriodDates(period);

    const [
        linksData,
        currentPeriodData,
        previousPeriodData,
        topLinks,
        topCountries,
        topSources,
        topDevices,
        dailyTimeSeries,
        dayOfWeekData
    ] = await Promise.all([
        getLinksStats(userId),
        getClicksInPeriod(userId, startDate, endDate),
        getClicksInPeriod(userId, previousStartDate, startDate),
        getTopLinks(userId, startDate, endDate, 10),
        getTopCountries(userId, startDate, endDate, 10),
        getTopSources(userId, startDate, endDate, 10),
        getTopDevices(userId, startDate, endDate, 5),
        getDailyTimeSeries(userId, startDate, endDate),
        getClicksByDayOfWeek(userId, startDate, endDate)
    ]);

    return {
        userId,
        period,
        startDate,
        endDate,
        totalLinks: linksData.totalLinks,
        totalClicks: currentPeriodData,
        activeLinks: linksData.activeLinks,
        topLinksByClicks: topLinks,
        topCountries,
        topSources,
        topDevices,
        dailyClicks: dailyTimeSeries,
        clicksByDayOfWeek: dayOfWeekData,
        previousPeriod: {
            totalClicks: previousPeriodData,
            totalLinks: linksData.totalLinks // simplificación, podríamos calcularlo histórico
        }
    };
}

/**
 * Stats básicos de links del usuario
 */
async function getLinksStats(userId: string) {


    const result = await Link.aggregate([
        { $match: { userId } },
        {
            $group: {
                _id: null,
                totalLinks: { $sum: 1 },
                activeLinks: {
                    $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                }
            }
        }
    ]);

    return result[0] || { totalLinks: 0, activeLinks: 0 };
}

/**
 * Total de clicks en un rango de fechas
 */
async function getClicksInPeriod(
    userId: string,
    startDate: string,
    endDate: string
): Promise<number> {



    // Obtener linkIds del usuario
    const links = await Link.find({ userId }, { _id: 1 }).lean();
    const linkIds = links.map(l => l._id);

    if (linkIds.length === 0) return 0;

    const result = await analyticsDaily.aggregate([
        {
            $match: {
                linkId: { $in: linkIds },
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: null,
                totalClicks: { $sum: '$totalClicks' }
            }
        }
    ]);

    return result[0]?.totalClicks || 0;
}

/**
 * Top links por clicks
 */
async function getTopLinks(
    userId: string,
    startDate: string,
    endDate: string,
    limit: number
) {



    const links = await Link.find({ userId }, { _id: 1, slug: 1 }).lean<LeanLink[]>();
    const linkIds = links.map(l => l._id);

    if (linkIds.length === 0) return [];

    const linkMap = new Map(links.map(l => [l._id.toString(), l.slug]));

    const result = await analyticsDaily.aggregate([
        {
            $match: {
                linkId: { $in: linkIds },
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$linkId',
                clicks: { $sum: '$totalClicks' }
            }
        },
        { $sort: { clicks: -1 } },
        { $limit: limit }
    ]);

    return result.map(r => ({
        linkId: r._id.toString(),
        clicks: r.clicks,
        slug: linkMap.get(r._id.toString()) || 'unknown'
    }));
}

/**
 * Top países por clicks
 */
async function getTopCountries(
    userId: string,
    startDate: string,
    endDate: string,
    limit: number
) {



    const links = await Link.find({ userId }, { _id: 1 }).lean();
    const linkIds = links.map(l => l._id);

    if (linkIds.length === 0) return [];

    // Agregación: convertir Map a array y sumar
    const result = await analyticsDaily.aggregate([
        {
            $match: {
                linkId: { $in: linkIds },
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $project: {
                countries: { $objectToArray: '$byCountry' }
            }
        },
        { $unwind: '$countries' },
        {
            $group: {
                _id: '$countries.k',
                clicks: { $sum: '$countries.v' }
            }
        },
        { $sort: { clicks: -1 } },
        { $limit: limit }
    ]);

    return result.map(r => ({
        country: r._id,
        clicks: r.clicks
    }));
}

/**
 * Top sources por clicks
 */
async function getTopSources(
    userId: string,
    startDate: string,
    endDate: string,
    limit: number
) {



    const links = await Link.find({ userId }, { _id: 1 }).lean();
    const linkIds = links.map(l => l._id);

    if (linkIds.length === 0) return [];

    const result = await analyticsDaily.aggregate([
        {
            $match: {
                linkId: { $in: linkIds },
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $project: {
                sources: { $objectToArray: '$bySource' }
            }
        },
        { $unwind: '$sources' },
        {
            $group: {
                _id: '$sources.k',
                clicks: { $sum: '$sources.v' }
            }
        },
        { $sort: { clicks: -1 } },
        { $limit: limit }
    ]);

    return result.map(r => ({
        source: r._id,
        clicks: r.clicks
    }));
}

/**
 * Top devices por clicks
 */
async function getTopDevices(
    userId: string,
    startDate: string,
    endDate: string,
    limit: number
) {



    const links = await Link.find({ userId }, { _id: 1 }).lean();
    const linkIds = links.map(l => l._id);

    if (linkIds.length === 0) return [];

    const result = await analyticsDaily.aggregate([
        {
            $match: {
                linkId: { $in: linkIds },
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $project: {
                devices: { $objectToArray: '$byDevice' }
            }
        },
        { $unwind: '$devices' },
        {
            $group: {
                _id: '$devices.k',
                clicks: { $sum: '$devices.v' }
            }
        },
        { $sort: { clicks: -1 } },
        { $limit: limit }
    ]);

    return result.map(r => ({
        device: r._id,
        clicks: r.clicks
    }));
}

/**
 * Serie temporal diaria
 */
async function getDailyTimeSeries(
    userId: string,
    startDate: string,
    endDate: string
) {



    const links = await Link.find({ userId }, { _id: 1 }).lean();
    const linkIds = links.map(l => l._id);

    if (linkIds.length === 0) return [];

    const result = await analyticsDaily.aggregate([
        {
            $match: {
                linkId: { $in: linkIds },
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$date',
                clicks: { $sum: '$totalClicks' }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    return result.map(r => ({
        date: r._id,
        clicks: r.clicks
    }));
}

/**
 * Clicks por día de la semana (0=domingo, 6=sábado)
 */
async function getClicksByDayOfWeek(
    userId: string,
    startDate: string,
    endDate: string
) {



    const links = await Link.find({ userId }, { _id: 1 }).lean();
    const linkIds = links.map(l => l._id);

    if (linkIds.length === 0) {
        return [0, 1, 2, 3, 4, 5, 6].map(day => ({ day, clicks: 0 }));
    }

    // MongoDB no parsea fecha string directamente, hacemos en JS
    const dailyData = await analyticsDaily.aggregate([
        {
            $match: {
                linkId: { $in: linkIds },
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$date',
                clicks: { $sum: '$totalClicks' }
            }
        }
    ]);

    // Procesar en JS (bajo volumen, ya agregado por día)
    const byDayOfWeek = [0, 0, 0, 0, 0, 0, 0];

    for (const { _id: date, clicks } of dailyData) {
        const d = new Date(date + 'T00:00:00Z');
        const dayOfWeek = d.getUTCDay();
        byDayOfWeek[dayOfWeek] += clicks;
    }

    return byDayOfWeek.map((clicks, day) => ({ day, clicks }));
}