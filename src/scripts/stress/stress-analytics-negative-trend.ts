/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import { AnalyticsEvent } from '@/app/models/analyticsEvents';
import { Link } from '@/app/models/links';
import { runAnalyticsWorker } from '@/workers/analyticsWorker';

/* ───────────── CONFIG ───────────── */

const USER_ID = '6952f0f4e1368bae6a04d2d6';
const DAYS = 90;

const START_CLICKS_PER_DAY = 800;   // fuerte inicio
const END_CLICKS_PER_DAY = 50;      // caída clara

const BATCH_SIZE = 10000;
const CHUNK_SIZE = 700;

/* ───────────── DATA POOLS ───────────── */

const COUNTRIES = ['US', 'BR', 'AR', 'MX'];
const DEVICES = ['desktop', 'mobile'];
const SOURCES = ['direct', 'instagram'];

/* ───────────── helpers ───────────── */

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/* ───────────── seed ───────────── */

async function seed() {
    console.log('🧹 Cleaning collections...');
    await AnalyticsEvent.deleteMany({});

    console.log('🔗 Creating link...');
    const [link] = await Link.insertMany([
        {
            userId: USER_ID,
            destinationUrl: 'https://decreasing.com',
            slug: 'decreasing-trend',
        },
    ]);

    console.log('📉 Generating STRICTLY DECREASING traffic...');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - DAYS);

    const events: any[] = [];

    for (let day = 0; day < DAYS; day++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + day);

        // interpolación lineal → siempre baja
        const clicksToday = Math.round(
            START_CLICKS_PER_DAY -
            ((START_CLICKS_PER_DAY - END_CLICKS_PER_DAY) * day) / DAYS
        );

        for (let i = 0; i < clicksToday; i++) {
            events.push({
                type: 'click',
                linkId: link._id,
                userId: USER_ID,
                country: pick(COUNTRIES),
                deviceType: pick(DEVICES),
                source: pick(SOURCES),
                timestamp: new Date(
                    date.getTime() + Math.random() * 24 * 60 * 60 * 1000
                ),
            });
        }
    }

    await AnalyticsEvent.insertMany(events, { ordered: false });

    console.log('✅ Decreasing trend seed complete');
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
        process.stdout.write(
            `⚙ Processed: ${result?.processed ?? 0} | Remaining: ${remaining}`
        );

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
