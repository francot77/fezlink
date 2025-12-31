/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConnect from '@/lib/mongodb';
import { AnalyticsEvent } from '@/app/models/analyticsEvents';
import AnalyticsDaily from '@/app/models/analyticsDaily';
import AnalyticsMonthly from '@/app/models/analyticsMonthly';
import { Link } from '@/app/models/links';
import GlobalClicks from '@/app/models/globalClicks';

type EventLink = {
    _id: string;
    linkId: string;
    timestamp: Date;
    country: string;
    source: string;
    deviceType: string;
};

const STALE_THRESHOLD = 5 * 60 * 1000;

/* ---------------- utils ---------------- */

function toDateKey(date: Date) {
    return date.toISOString().slice(0, 10);
}

function toMonthKey(date: Date) {
    return date.toISOString().slice(0, 7);
}

/* ---------------- aggregation ---------------- */

function processEvents(events: EventLink[]) {
    const clicksByLink = new Map<string, number>();
    const countryByLink = new Map<string, Record<string, number>>();
    const dailyAgg = new Map<string, any>();
    const monthlyAgg = new Map<string, any>();

    for (const e of events) {
        const linkId = e.linkId.toString();
        const dateKey = toDateKey(e.timestamp);
        const monthKey = toMonthKey(e.timestamp);

        const country = e.country || 'unknown';
        const source = e.source || 'direct';
        const device = e.deviceType || 'unknown';

        // ---- LINK TOTAL ----
        clicksByLink.set(linkId, (clicksByLink.get(linkId) ?? 0) + 1);

        const byCountry = countryByLink.get(linkId) ?? {};
        byCountry[country] = (byCountry[country] ?? 0) + 1;
        countryByLink.set(linkId, byCountry);

        // ---- DAILY ----
        const dailyKey = `${linkId}:${dateKey}`;
        const d = dailyAgg.get(dailyKey) ?? {
            linkId,
            date: dateKey,
            totalClicks: 0,
            byCountry: {},
            bySource: {},
            byDevice: {},
        };

        d.totalClicks++;
        d.byCountry[country] = (d.byCountry[country] ?? 0) + 1;
        d.bySource[source] = (d.bySource[source] ?? 0) + 1;
        d.byDevice[device] = (d.byDevice[device] ?? 0) + 1;
        dailyAgg.set(dailyKey, d);

        // ---- MONTHLY ----
        const monthlyKey = `${linkId}:${monthKey}`;
        const m = monthlyAgg.get(monthlyKey) ?? {
            linkId,
            month: monthKey,
            totalClicks: 0,
            byCountry: {},
            bySource: {},
            byDevice: {},
        };

        m.totalClicks++;
        m.byCountry[country] = (m.byCountry[country] ?? 0) + 1;
        m.bySource[source] = (m.bySource[source] ?? 0) + 1;
        m.byDevice[device] = (m.byDevice[device] ?? 0) + 1;
        monthlyAgg.set(monthlyKey, m);
    }

    return { clicksByLink, countryByLink, dailyAgg, monthlyAgg };
}

/* ---------------- worker ---------------- */
const BATCH_SIZE = 10000;
const CHUNK_SIZE = 700;
export async function runAnalyticsWorker(batchSize: number = BATCH_SIZE, chunkSize: number = CHUNK_SIZE) {
    async function persistInChunks<T>(
        items: T[],
        fn: (chunk: T[]) => Promise<void>
    ) {
        for (let i = 0; i < items.length; i += chunkSize) {
            await fn(items.slice(i, i + chunkSize));
        }
    }

    await dbConnect();
    const workerId = `w-${process.pid}-${Date.now()}`;

    /* ===== 1. CLAIM ===== */

    const ids = await AnalyticsEvent.find(
        {
            type: 'click',
            processedAt: null,
            processingStartedAt: null,
        },
        { _id: 1 }
    )
        .sort({ createdAt: 1 })
        .limit(batchSize)
        .lean();

    if (ids.length === 0) return { processed: 0 };

    const claim = await AnalyticsEvent.updateMany(
        {
            _id: { $in: ids.map(d => d._id) },
            processingStartedAt: null,
        },
        {
            $set: {
                processingStartedAt: new Date(),
                workerId,
            },
        }
    );

    if (claim.modifiedCount === 0) return { processed: 0 };

    const events = await AnalyticsEvent.find({
        _id: { $in: ids.map(d => d._id) },
    }).lean<EventLink[]>();

    /* ===== 2. PROCESS ===== */

    try {
        const { clicksByLink, countryByLink, dailyAgg, monthlyAgg } =
            processEvents(events);

        // ---- LINKS (TOTAL + BY COUNTRY) ----
        await persistInChunks([...clicksByLink.entries()], async chunk => {
            await Link.bulkWrite(
                chunk.map(([linkId, count]) => {
                    const inc: Record<string, number> = {
                        totalClicks: count,
                    };

                    const byCountry = countryByLink.get(linkId);
                    if (byCountry) {
                        for (const [c, v] of Object.entries(byCountry)) {
                            inc[`byCountry.${c}`] = v;
                        }
                    }

                    return {
                        updateOne: {
                            filter: { _id: linkId },
                            update: { $inc: inc },
                        },
                    };
                }),
                { ordered: false }
            );
        });

        // ---- DAILY ----
        await persistInChunks([...dailyAgg.values()], async chunk => {
            await AnalyticsDaily.bulkWrite(
                chunk.map(agg => ({
                    updateOne: {
                        filter: { linkId: agg.linkId, date: agg.date },
                        update: { $inc: buildInc(agg) },
                        upsert: true,
                    },
                })),
                { ordered: false }
            );
        });

        // ---- MONTHLY ----
        await persistInChunks([...monthlyAgg.values()], async chunk => {
            await AnalyticsMonthly.bulkWrite(
                chunk.map(agg => ({
                    updateOne: {
                        filter: { linkId: agg.linkId, month: agg.month },
                        update: { $inc: buildInc(agg) },
                        upsert: true,
                    },
                })),
                { ordered: false }
            );
        });

        // ---- GLOBAL ----
        await GlobalClicks.updateOne({}, { $inc: { count: events.length } });

        // ---- MARK PROCESSED ----
        await AnalyticsEvent.updateMany(
            { _id: { $in: events.map(e => e._id) } },
            { $set: { processedAt: new Date() } }
        );

        return { processed: events.length };

    } catch (err) {
        await AnalyticsEvent.updateMany(
            { _id: { $in: events.map(e => e._id) } },
            { $unset: { processingStartedAt: '', workerId: '' } }
        );
        throw err;
    }
}

/* ---------------- helpers ---------------- */

function buildInc(agg: any) {
    const inc: Record<string, number> = { totalClicks: agg.totalClicks };

    for (const [k, v] of Object.entries(agg.byCountry)) inc[`byCountry.${k}`] = v as number;
    for (const [k, v] of Object.entries(agg.bySource)) inc[`bySource.${k}`] = v as number;
    for (const [k, v] of Object.entries(agg.byDevice)) inc[`byDevice.${k}`] = v as number;

    return inc;
}

/* ---------------- cleanup ---------------- */

export async function cleanupStalledEvents() {
    await dbConnect();

    const res = await AnalyticsEvent.updateMany(
        {
            processingStartedAt: { $lt: new Date(Date.now() - STALE_THRESHOLD) },
            processedAt: null,
        },
        { $unset: { processingStartedAt: '', workerId: '' } }
    );

    return res.modifiedCount;
}
