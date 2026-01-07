/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import { AnalyticsEvent } from '@/app/models/analyticsEvents';
import { Link } from '@/app/models/links';
import { runAnalyticsWorker } from '@/workers/analyticsWorker';

/* ───────────── CONFIG ───────────── */

const USER_ID = '6952f0f4e1368bae6a04d2d6';
const TOTAL_EVENTS = 18000;
const BATCH_SIZE = 10000;
const CHUNK_SIZE = 700;

/*
    Escenarios NEGATIVOS reales:
    - Caída fuerte en últimos días
    - Dependencia extrema de una fuente
    - Links sin tráfico
    - Ruido geográfico (sin mercado claro)
*/

const TEMPORAL_DROP = true;
const EXTREME_SOURCE_DEPENDENCY = true;
const DEAD_LINKS = true;
const GEO_NO_SIGNAL = true;

/* ───────────── DATA POOLS ───────────── */

const COUNTRIES = ['US', 'BR', 'AR', 'MX', 'FR', 'ES', 'NZ', 'JM', 'PE'];
const DEVICES = ['desktop', 'mobile', 'tablet'];
const SOURCES = ['direct', 'instagram', 'twitter', 'google'];

/* ───────────── helpers ───────────── */

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weighted<T>(primary: T, others: T[], weight = 0.9): T {
  return Math.random() < weight ? primary : pick(others);
}

/**
 * Genera FECHAS VIEJAS.
 * Muy pocos eventos recientes → caída clara
 */
function negativeDate(from: Date, to: Date): Date {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  if (TEMPORAL_DROP && Math.random() < 0.85) {
    // 85% del tráfico es viejo
    return new Date(from.getTime() + Math.random() * (sevenDaysAgo - from.getTime()));
  }

  return new Date(sevenDaysAgo + Math.random() * (now - sevenDaysAgo));
}

/* ───────────── seed ───────────── */

async function seed() {
  console.log('🧹 Cleaning collections...');
  await AnalyticsEvent.deleteMany({});

  console.log('🔗 Creating 5 links (3 zombies)...');
  const links = await Link.insertMany(
    Array.from({ length: 5 }).map((_, i) => ({
      userId: USER_ID,
      destinationUrl: `https://negative${i}.com`,
      slug: `negative-${i}`,
    }))
  );

  console.log(`📉 Generating ${TOTAL_EVENTS} NEGATIVE events...`);

  const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const to = new Date();

  const events = [];

  for (let i = 0; i < TOTAL_EVENTS; i++) {
    // Solo 1 link recibe tráfico real
    if (DEAD_LINKS && Math.random() < 0.65) {
      // links[1..4] → prácticamente muertos
      continue;
    }

    const link = links[0];

    const country = GEO_NO_SIGNAL
      ? pick(COUNTRIES) // sin concentración
      : 'US';

    const device = pick(DEVICES);

    const source = EXTREME_SOURCE_DEPENDENCY ? weighted('instagram', SOURCES, 0.95) : pick(SOURCES);

    events.push({
      type: 'click',
      linkId: link._id,
      userId: USER_ID,
      country,
      deviceType: device,
      source,
      timestamp: negativeDate(from, to),
    });
  }

  await AnalyticsEvent.insertMany(events, { ordered: false });

  console.log('✅ Negative seed complete');
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
