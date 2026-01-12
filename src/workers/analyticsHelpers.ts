import { Link } from '@/app/models/links';
import AnalyticsDaily from '@/app/models/analyticsDaily';
import AnalyticsMonthly from '@/app/models/analyticsMonthly';
import GlobalClicks from '@/app/models/globalClicks';

/* ---------------- Types ---------------- */

export type EventLink = {
  _id: string; // or any unique identifier
  linkId: string;
  timestamp: Date;
  country: string;
  source: string;
  context?: string;
  deviceType: string;
};

/* ---------------- Utils ---------------- */

export function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function toMonthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}

export function buildInc(agg: any) {
  const inc: Record<string, number> = { totalClicks: agg.totalClicks };

  for (const [k, v] of Object.entries(agg.byCountry)) inc[`byCountry.${k}`] = v as number;
  for (const [k, v] of Object.entries(agg.bySource)) inc[`bySource.${k}`] = v as number;
  for (const [k, v] of Object.entries(agg.byContext || {})) inc[`byContext.${k}`] = v as number;
  for (const [k, v] of Object.entries(agg.byDevice)) inc[`byDevice.${k}`] = v as number;

  return inc;
}

/* ---------------- Aggregation ---------------- */

export function processEvents(events: EventLink[]) {
  const clicksByLink = new Map<string, number>();
  const countryByLink = new Map<string, Record<string, number>>();
  const dailyAgg = new Map<string, any>();
  const monthlyAgg = new Map<string, any>();

  for (const e of events) {
    const linkId = e.linkId.toString();
    const dateKey = toDateKey(new Date(e.timestamp));
    const monthKey = toMonthKey(new Date(e.timestamp));

    const country = e.country || 'unknown';
    const source = e.source || 'direct';
    const context = e.context || 'unknown';
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
      byContext: {},
      byDevice: {},
    };

    d.totalClicks++;
    d.byCountry[country] = (d.byCountry[country] ?? 0) + 1;
    d.bySource[source] = (d.bySource[source] ?? 0) + 1;
    d.byContext[context] = (d.byContext[context] ?? 0) + 1;
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
      byContext: {},
      byDevice: {},
    };

    m.totalClicks++;
    m.byCountry[country] = (m.byCountry[country] ?? 0) + 1;
    m.bySource[source] = (m.bySource[source] ?? 0) + 1;
    m.byContext[context] = (m.byContext[context] ?? 0) + 1;
    m.byDevice[device] = (m.byDevice[device] ?? 0) + 1;
    monthlyAgg.set(monthlyKey, m);
  }

  return { clicksByLink, countryByLink, dailyAgg, monthlyAgg };
}

/* ---------------- Persistence ---------------- */

export async function persistAggregatedData(
  aggregatedData: ReturnType<typeof processEvents>,
  chunkSize: number = 2000 // Increased default chunk size
) {
  const { clicksByLink, countryByLink, dailyAgg, monthlyAgg } = aggregatedData;

  // Use Promise.all to run bulk writes in parallel where safe
  // Note: We should be careful not to overload DB connection pool

  async function persistInChunks<T>(items: T[], fn: (chunk: T[]) => Promise<void>) {
    for (let i = 0; i < items.length; i += chunkSize) {
      await fn(items.slice(i, i + chunkSize));
    }
  }

  const tasks = [];

  // 1. Links update (Critical)
  if (clicksByLink.size > 0) {
    tasks.push(persistInChunks([...clicksByLink.entries()], async (chunk) => {
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
    }));
  }

  // 2. Daily & Monthly can run in parallel with Links
  if (dailyAgg.size > 0) {
    tasks.push(persistInChunks([...dailyAgg.values()], async (chunk) => {
      await AnalyticsDaily.bulkWrite(
        chunk.map((agg) => ({
          updateOne: {
            filter: { linkId: agg.linkId, date: agg.date },
            update: { $inc: buildInc(agg) },
            upsert: true,
          },
        })),
        { ordered: false }
      );
    }));
  }

  if (monthlyAgg.size > 0) {
    tasks.push(persistInChunks([...monthlyAgg.values()], async (chunk) => {
      await AnalyticsMonthly.bulkWrite(
        chunk.map((agg) => ({
          updateOne: {
            filter: { linkId: agg.linkId, month: agg.month },
            update: { $inc: buildInc(agg) },
            upsert: true,
          },
        })),
        { ordered: false }
      );
    }));
  }

  // Execute all main persistence tasks in parallel
  await Promise.all(tasks);

  // ---- GLOBAL ----
  let totalCount = 0;
  for (const count of clicksByLink.values()) {
    totalCount += count;
  }

  if (totalCount > 0) {
    await GlobalClicks.updateOne({}, { $inc: { count: totalCount } }, { upsert: true });
  }
}
