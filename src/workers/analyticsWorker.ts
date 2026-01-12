/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConnect from '@/lib/mongodb';
import { AnalyticsEvent } from '@/app/models/analyticsEvents';
import { 
  EventLink, 
  processEvents, 
  persistAggregatedData 
} from './analyticsHelpers';

const STALE_THRESHOLD = 5 * 60 * 1000;

/* ---------------- worker ---------------- */
const BATCH_SIZE = 10000;
const CHUNK_SIZE = 700;

export async function runAnalyticsWorker(
  batchSize: number = BATCH_SIZE,
  chunkSize: number = CHUNK_SIZE
) {
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
      _id: { $in: ids.map((d) => d._id) },
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
    _id: { $in: ids.map((d) => d._id) },
  }).lean<EventLink[]>();

  /* ===== 2. PROCESS ===== */

  try {
    const aggregatedData = processEvents(events);

    // Persist data using helper
    await persistAggregatedData(aggregatedData, chunkSize);

    // ---- MARK PROCESSED ----
    await AnalyticsEvent.updateMany(
      { _id: { $in: events.map((e) => e._id) } },
      { $set: { processedAt: new Date() } }
    );

    return { processed: events.length };
  } catch (err) {
    await AnalyticsEvent.updateMany(
      { _id: { $in: events.map((e) => e._id) } },
      { $unset: { processingStartedAt: '', workerId: '' } }
    );
    throw err;
  }
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

