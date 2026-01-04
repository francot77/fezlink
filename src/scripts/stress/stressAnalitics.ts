/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import { AnalyticsEvent } from '@/app/models/analyticsEvents';
import AnalyticsDaily from '@/app/models/analyticsDaily';
import analyticsMonthly from '@/app/models/analyticsMonthly';
import { Link } from '@/app/models/links';
import { runAnalyticsWorker } from '@/workers/analyticsWorker';


const PARALLEL_WORKERS = 1;
const USER_ID = '6952f0f4e1368bae6a04d2d6';

export const COUNTRIES = [
    'AF', 'AL', 'AO', 'AR', 'AM', 'AU', 'AT', 'AZ',
    'BD', 'BE', 'BF', 'BG', 'BI', 'BJ', 'BO', 'BR', 'BW', 'BY',
    'CA', 'CD', 'CF', 'CH', 'CL', 'CN', 'CO', 'CR', 'CU', 'CZ',
    'DE', 'DK', 'DO', 'DZ',
    'EC', 'EE', 'EG', 'ES',
    'FI', 'FR',
    'GB', 'GE', 'GH', 'GL', 'GN', 'GQ', 'GR', 'GT',
    'HN', 'HR', 'HT', 'HU',
    'ID', 'IE', 'IL', 'IN', 'IQ', 'IR', 'IS', 'IT',
    'JM', 'JO', 'JP',
    'KE', 'KG', 'KH', 'KP', 'KR', 'KW', 'KZ',
    'LA', 'LB', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY',
    'MA', 'MD', 'ME', 'MG', 'MK', 'ML', 'MM', 'MN', 'MR', 'MT', 'MX', 'MY', 'MZ',
    'NA', 'NE', 'NG', 'NI', 'NL', 'NO', 'NP', 'NZ',
    'OM',
    'PA', 'PE', 'PG', 'PH', 'PK', 'PL', 'PT', 'PY',
    'QA',
    'RO', 'RS', 'RU', 'RW',
    'SA', 'SD', 'SE', 'SG', 'SI', 'SK', 'SL', 'SN', 'SO', 'SR', 'SV', 'SY', 'SZ',
    'TD', 'TG', 'TH', 'TJ', 'TL', 'TN', 'TR', 'TT', 'TW', 'TZ',
    'UA', 'UG', 'US', 'UY', 'UZ',
    'VE', 'VN',
    'YE',
    'ZA', 'ZM', 'ZW',
];

const SOURCES = ['direct', 'instagram', 'twitter', 'google'];
const DEVICES = ['desktop', 'mobile', 'tablet'];
const TOTAL_EVENTS = 25846;
const BATCH_SIZE = 10000;
const CHUNK_SIZE = 700;

let startTime = 0;
let lastCheckTime = 0;
let lastRemaining = TOTAL_EVENTS;
let throughputSamples: number[] = [];

/* ───────────────────────── helpers ───────────────────────── */

function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(from: Date, to: Date): Date {
    return new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()));
}

const heavy = ['US', 'BR', 'AR', 'AR', 'MX', 'ES', 'FR', 'JM', 'PE', 'NZ'];
const light = COUNTRIES;

function randomCountry() {
    return Math.random() < 0.35
        ? randomItem(heavy)
        : randomItem(light);
}
function renderStatus(line: string) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(line);
}

/* ───────────────────────── seed ───────────────────────── */

async function seed() {
    console.log('🧹 Cleaning collections...');
    await Promise.all([
        AnalyticsEvent.deleteMany({}),
        //AnalyticsDaily.deleteMany({}),
        //analyticsMonthly.deleteMany({}),
        //Link.deleteMany({}),
    ]);

    console.log('🔗 Creating link...');
    const link = await Link.create({
        userId: USER_ID,
        destinationUrl: 'https://examplern5.com',
        slug: 'stress-test-link',
    });

    console.log(`📦 Generating ${TOTAL_EVENTS} events...`);

    const from = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000);
    const to = new Date();

    const events = Array.from({ length: TOTAL_EVENTS }).map(() => ({
        type: 'click',
        linkId: link._id,
        userId: USER_ID,
        country: randomCountry(),
        source: randomItem(SOURCES),
        deviceType: randomItem(DEVICES),
        timestamp: randomDate(from, to),
    }));

    await AnalyticsEvent.insertMany(events, { ordered: false });

    console.log('✅ Seed complete');
    return link;
}

/* ───────────────────────── workers ───────────────────────── */

async function runWorkers() {
    console.log(`🚀 Running ${PARALLEL_WORKERS} workers in parallel...`);

    startTime = Date.now();
    lastCheckTime = startTime;
    lastRemaining = TOTAL_EVENTS;
    throughputSamples = [];

    while (true) {
        const results = await Promise.all(
            Array.from({ length: PARALLEL_WORKERS }).map(() =>
                runAnalyticsWorker(BATCH_SIZE, CHUNK_SIZE)
            )
        );

        const processed = results.reduce(
            (sum, r) => sum + (r?.processed ?? 0),
            0
        );

        const remaining = await AnalyticsEvent.countDocuments({
            processedAt: null,
        });

        const now = Date.now();
        const deltaTime = (now - lastCheckTime) / 1000;
        const deltaEvents = lastRemaining - remaining;
        const throughput = deltaEvents / (deltaTime || 1);

        throughputSamples.push(throughput);

        renderStatus(
            `⚙ Batch processed: ${processed} | Remaining: ${remaining} | Throughput: ${throughput.toFixed(
                1
            )} ev/s`
        );

        lastCheckTime = now;
        lastRemaining = remaining;

        if (remaining === 0) break;
    }

    // limpiar la línea viva
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);

    const totalSeconds = (Date.now() - startTime) / 1000;
    const avgThroughput =
        throughputSamples.reduce((a, b) => a + b, 0) /
        throughputSamples.length;

    console.log(`🏁 Total time: ${totalSeconds.toFixed(1)}s`);
    console.log(`📊 Avg throughput: ${avgThroughput.toFixed(1)} ev/s`);
}

/* ───────────────────────── verify ───────────────────────── */

async function verify(linkId: mongoose.Types.ObjectId) {
    const remaining = await AnalyticsEvent.countDocuments({ processedAt: null });
    const link = await Link.findById(linkId);

    const daily = await AnalyticsDaily.aggregate([
        { $match: { linkId } },
        { $group: { _id: null, total: { $sum: '$totalClicks' } } },
    ]);

    const dailyTotal = daily[0]?.total ?? 0;

    console.log('🔍 Verification');
    console.log('ChunkSize: ', CHUNK_SIZE)
    console.log('BatchSize: ', BATCH_SIZE)
    console.log('Remaining events:', remaining);
    console.log('Link.totalClicks:', link?.totalClicks);
    console.log('Daily totalClicks:', dailyTotal);
    if (
        remaining !== 0 ||
        link?.totalClicks !== TOTAL_EVENTS ||
        dailyTotal !== TOTAL_EVENTS
    ) {
        throw new Error('❌ VERIFICATION FAILED: counts do not match');
    }

    console.log('✅ VERIFICATION PASSED');
}

/* ───────────────────────── main ───────────────────────── */

(async () => {
    await dbConnect();
    const link = await seed();
    await runWorkers();
    await verify(link._id);
    await mongoose.disconnect();
})();
