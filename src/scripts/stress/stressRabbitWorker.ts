import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), '.env.local'),
});

import dbConnect from '@/lib/mongodb';
import { Link } from '@/app/models/links';
import { ClickEvent, emitAnalyticsEvent } from '@/lib/emitAnalyticsEvent';
import { v4 as uuidv4 } from 'uuid';
import pLimit from 'p-limit';

import cluster from 'cluster';
import os from 'os';

// ================= CONFIG =================

const TARGET_USER_ID = '6964604b5a18b449c156887d';
const TEST_DURATION_SECONDS = process.env.DURATION ? parseInt(process.env.DURATION) : 300;
// Increased concurrency PER WORKER. 
// If you have 8 cores, total concurrency = 8 * 1000 = 8000 inflight
const MAX_INFLIGHT_EVENTS = 1000;

// ... rest of imports and constants ...

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`🚀 Starting CLUSTERED Stress Test with ${numCPUs} workers`);
  console.log(`⏱ Duration: ${TEST_DURATION_SECONDS}s`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({ DURATION: TEST_DURATION_SECONDS.toString() });
  }

  let totalSent = 0;
  let totalFailed = 0;
  let activeWorkers = numCPUs;

  cluster.on('message', (worker, message) => {
    if (message.type === 'progress') {
      // Aggregate progress (optional, tricky to do real-time cleanly)
    } else if (message.type === 'done') {
      totalSent += message.sent;
      totalFailed += message.failed;
    }
  });

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    activeWorkers--;
    if (activeWorkers === 0) {
      console.log('\n\n✅ ALL WORKERS FINISHED');
      console.log(`📦 Total Sent: ${totalSent}`);
      console.log(`❌ Total Failed: ${totalFailed}`);
      // Approx rate calculation requires start time tracking per worker or global
      // but simplistic view:
      const rate = (totalSent / TEST_DURATION_SECONDS).toFixed(2);
      console.log(`⚡ Avg Total Throughput: ${rate} events/sec`);
      process.exit(0);
    }
  });

} else {
  // Worker logic
  stressTest();
}

// random dimensions
const COUNTRIES = ['US', 'ES', 'MX', 'BR', 'AR', 'CO', 'FR', 'DE', 'JP', 'IN'];
const DEVICES = ['mobile', 'desktop', 'tablet'] as const;
const SOURCES = ['direct', 'google', 'twitter', 'facebook', 'linkedin'];

function rand<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function stressTest() {
  console.log(`[Worker ${process.pid}] Starting...`);

  await dbConnect();
  console.log('✅ MongoDB connected');

  const links = await Link.find({ userId: TARGET_USER_ID })
    .select('_id')
    .lean();

  if (!links.length) {
    console.error('❌ No links found');
    process.exit(1);
  }

  console.log(`🔗 Cycling through ${links.length} links`);

  let sent = 0;
  let failed = 0;
  const startedAt = Date.now();
  const endTime = startedAt + (TEST_DURATION_SECONDS * 1000);

  // global limiter
  const limit = pLimit(MAX_INFLIGHT_EVENTS);
  const executing = new Set<Promise<void>>();

  let isRunning = true;

  // Loop until time is up
  while (Date.now() < endTime && isRunning) {
    // Pick a random link for better distribution
    const link = rand(links);

    const event: ClickEvent = {
      id: uuidv4(),
      type: 'click',
      linkId: (link as any)._id.toString(),
      userId: TARGET_USER_ID,
      timestamp: new Date(),
      country: rand(COUNTRIES),
      source: rand(SOURCES),
      deviceType: rand(DEVICES),
      userAgent: 'ContinuousStressTest/1.0',
    };

    const task = limit(async () => {
      try {
        await emitAnalyticsEvent(event);
        sent++;
      } catch {
        failed++;
      }

      if ((sent + failed) % 500 === 0) {
        const elapsed = (Date.now() - startedAt) / 1000;
        const currentRate = (sent / elapsed).toFixed(0);
        const timeLeft = Math.max(0, (endTime - Date.now()) / 1000).toFixed(0);

        process.stdout.write(
          `\r📤 Sent: ${sent} | ❌ Failed: ${failed} | ⚡ Rate: ${currentRate}/s | ⏳ Left: ${timeLeft}s`
        );
      }
    });

    executing.add(task);
    task.then(() => executing.delete(task));

    // Proper backpressure: wait if we hit concurrency limit
    if (limit.activeCount >= MAX_INFLIGHT_EVENTS || limit.pendingCount > 0) {
      // Wait for at least one task to finish to make room
      await Promise.race(executing);
    }
  }

  isRunning = false;

  console.log('\n⏳ Waiting for pending events to flush...');

  // Wait for all executing tasks to finish
  await Promise.all(executing);

  // Double check limit queue is empty
  while (limit.activeCount > 0) {
    await new Promise(r => setTimeout(r, 100));
  }

  const duration = (Date.now() - startedAt) / 1000;
  const rate = (sent / duration).toFixed(2);

  console.log(`[Worker ${process.pid}] Finished. Sent: ${sent}`);

  if (process.send) {
    process.send({ type: 'done', sent, failed });
  }
  process.exit(0);
}

// Ensure the script runs if called directly or as worker
// The cluster check at top handles the branching logic
// but we need to remove the auto-invocation at the bottom which might be duplicated logic
// actually we already invoke stressTest() in the else block above.
// So we just need to remove the call at the bottom.

