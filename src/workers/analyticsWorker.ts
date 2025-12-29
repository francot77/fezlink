import dbConnect from '@/lib/mongodb';
import { AnalyticsEvent } from '@/app/models/analyticsEvents';
import AnalyticsDaily from '@/app/models/analyticsDaily';
import { Link } from '@/app/models/links';
type EventLink = { linkId: string; timestamp: Date; country: string; source: string; deviceType: string; _id: string }
function toDateKey(date: Date): string {
    return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function runAnalyticsWorker(batchSize = 500) {
    await dbConnect();

    const events = await AnalyticsEvent.find({
        type: 'click',
        processedAt: null,
    }).limit(batchSize);

    if (events.length === 0) {
        console.log('[Worker] No events to process');
        return;
    }

    const clicksByLink = new Map<string, number>();
    const dailyAgg = new Map<string, {
        linkId: string;
        date: string;
        totalClicks: number;
        byCountry: Record<string, number>;
        bySource: Record<string, number>;
        byDevice: Record<string, number>;
    }>();
    const processedIds = [];

    for (const event of events as EventLink[]) {
        const linkId = event.linkId.toString();
        const dateKey = toDateKey(event.timestamp);
        const dailyKey = `${linkId}:${dateKey}`;

        // total clicks por link
        clicksByLink.set(
            linkId,
            (clicksByLink.get(linkId) ?? 0) + 1
        );

        // aggregate diario
        const agg = dailyAgg.get(dailyKey) ?? {
            linkId,
            date: dateKey,
            totalClicks: 0,
            byCountry: {},
            bySource: {},
            byDevice: {},
        };

        agg.totalClicks++;
        agg.byCountry[event.country] = (agg.byCountry[event.country] ?? 0) + 1;
        agg.bySource[event.source] = (agg.bySource[event.source] ?? 0) + 1;
        agg.byDevice[event.deviceType] = (agg.byDevice[event.deviceType] ?? 0) + 1;

        dailyAgg.set(dailyKey, agg);
        processedIds.push(event._id);
    }

    // 🔹 bulk update links
    if (clicksByLink.size > 0) {
        await Link.bulkWrite(
            [...clicksByLink.entries()].map(([linkId, count]) => ({
                updateOne: {
                    filter: { _id: linkId },
                    update: { $inc: { totalClicks: count } },
                },
            }))
        );
    }

    // 🔹 bulk upsert analytics_daily
    if (dailyAgg.size > 0) {
        await AnalyticsDaily.bulkWrite(
            [...dailyAgg.values()].map(agg => {
                const inc: Record<string, number> = {
                    totalClicks: agg.totalClicks,
                };

                for (const [k, v] of Object.entries(agg.byCountry)) {
                    inc[`byCountry.${k}`] = v;
                }
                for (const [k, v] of Object.entries(agg.bySource)) {
                    inc[`bySource.${k}`] = v;
                }
                for (const [k, v] of Object.entries(agg.byDevice)) {
                    inc[`byDevice.${k}`] = v;
                }

                return {
                    updateOne: {
                        filter: { linkId: agg.linkId, date: agg.date },
                        update: { $inc: inc },
                        upsert: true,
                    },
                };
            })
        );
    }

    // 🔹 marcar eventos como procesados
    await AnalyticsEvent.updateMany(
        { _id: { $in: processedIds } },
        { $set: { processedAt: new Date() } }
    );

    console.log(`[Worker] Processed ${processedIds.length} events`);
}
