import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import { AnalyticsEvent } from '@/app/models/analyticsEvents';
//import AnalyticsDaily from '@/app/models/analyticsDaily';
import { Link } from '@/app/models/links';
import { runAnalyticsWorker } from '@/workers/analyticsWorker';

/* ───────────── CONFIG ───────────── */

const USER_ID = '6952f0f4e1368bae6a04d2d6';
const TOTAL_EVENTS = 30000;
const BATCH_SIZE = 10000;
const CHUNK_SIZE = 700;

// ───────────── TEST MODES ─────────────
const GEO_CONCENTRATION = true;
const GEO_DIVERSIFICATION = true;

const DEVICE_DOMINANCE = true;
const SOURCE_DOMINANCE = true;

const TOP_LINK_DOMINANCE = true;
//const HIGH_ENGAGEMENT = true;

const TEMPORAL_SPIKE = true;
// ─────────────────────────────────────

const COUNTRIES = ['US', 'BR', 'AR', 'MX', 'FR', 'ES', 'NZ', 'JM', 'PE'];
const DEVICES = ['desktop', 'mobile', 'tablet'];
const SOURCES = ['direct', 'instagram', 'twitter', 'google'];

/* ───────────── helpers ───────────── */

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weighted<T>(primary: T, others: T[], weight = 0.75): T {
  return Math.random() < weight ? primary : pick(others);
}

function randomDate(from: Date, to: Date): Date {
  if (TEMPORAL_SPIKE && Math.random() < 0.3) {
    return new Date(); // hoy → spike
  }
  return new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()));
}

/* ───────────── seed ───────────── */

async function seed() {
  console.log('🧹 Cleaning collections...');
  await AnalyticsEvent.deleteMany({});

  console.log('🔗 Creating 5 links...');
  const links = await Link.insertMany(
    Array.from({ length: 5 }).map((_, i) => ({
      userId: USER_ID,
      destinationUrl: `https://example${i}.com`,
      slug: `stress-${i}`,
    }))
  );

  console.log(`📦 Generating ${TOTAL_EVENTS} events...`);

  const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const to = new Date();

  const events = Array.from({ length: TOTAL_EVENTS }).map(() => {
    const link =
      TOP_LINK_DOMINANCE && Math.random() < 0.6
        ? links[0] // domina 1 link
        : pick(links.slice(1));

    const country = GEO_CONCENTRATION
      ? weighted('US', COUNTRIES, 0.7)
      : GEO_DIVERSIFICATION
        ? pick(COUNTRIES)
        : 'US';

    const device = DEVICE_DOMINANCE ? weighted('mobile', DEVICES, 0.8) : pick(DEVICES);

    const source = SOURCE_DOMINANCE ? weighted('instagram', SOURCES, 0.7) : pick(SOURCES);

    return {
      type: 'click',
      linkId: link._id,
      userId: USER_ID,
      country,
      deviceType: device,
      source,
      timestamp: randomDate(from, to),
    };
  });

  await AnalyticsEvent.insertMany(events, { ordered: false });

  console.log('✅ Seed complete');
}

/* ───────────── workers ───────────── */

async function runWorkers() {
  console.log('🚀 Running analytics worker...');

  while (true) {
    const result = await runAnalyticsWorker(BATCH_SIZE, CHUNK_SIZE);

    const remaining = await AnalyticsEvent.countDocuments({
      processedAt: null,
    });

    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`⚙ Processed: ${result?.processed ?? 0} | Remaining: ${remaining}`);

    if (remaining === 0) break;
  }

  console.log('\n🏁 Worker finished');
}

/* ───────────── main ───────────── */

(async () => {
  await dbConnect();
  await seed();
  await runWorkers();
  await mongoose.disconnect();
})();
