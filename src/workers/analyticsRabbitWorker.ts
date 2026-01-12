import amqp from 'amqplib';
import dbConnect from '@/lib/mongodb';
import {
  EventLink,
  persistAggregatedData,
  processEvents,
} from './analyticsHelpers';
import { v4 as uuidv4 } from 'uuid';

// ================= CONFIG =================

const RABBITMQ_URI = process.env.RABBITMQ_URI || 'amqp://localhost';
const QUEUE_NAME = 'analytics.clicks';

// Broker + worker tuning
const PREFETCH = 3000;              // Aggressive prefetch for high throughput
const MAX_BATCH_SIZE = 3000;        // Match prefetch to maximize batch efficiency
const FLUSH_INTERVAL_MS = 2000;    // More frequent flushes for lower latency

// ================= WORKER =================

export async function runRabbitWorker() {
  const workerId = `w-${process.pid}-${Date.now().toString().slice(-4)}`;

  // --- DB ---
  await dbConnect();
  console.log(`[RabbitWorker:${workerId}] Connected to MongoDB`);

  // --- AMQP ---
  const connection = await amqp.connect(RABBITMQ_URI);
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE_NAME, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': 'analytics.dlq.direct',
      'x-dead-letter-routing-key': 'dead.letter',
    },
  });

  await channel.prefetch(PREFETCH);

  console.log(`[RabbitWorker:${workerId}] Listening on queue: ${QUEUE_NAME}`);
  console.log(`[RabbitWorker:${workerId}] Prefetch=${PREFETCH} Batch=${MAX_BATCH_SIZE}`);

  // ================= STATE =================

  let eventBuffer: { msg: amqp.Message; event: EventLink }[] = [];
  let isFlushing = false;

  // ================= FLUSH LOGIC =================

  const flush = async () => {
    if (isFlushing) return;
    if (eventBuffer.length === 0) return;

    isFlushing = true;

    const batch = eventBuffer;
    eventBuffer = [];

    try {
      const events = batch.map(b => b.event);

      const aggregated = processEvents(events);
      await persistAggregatedData(aggregated);

      // Batch ACK strategy:
      const lastMsg = batch[batch.length - 1].msg;
      channel.ack(lastMsg, true);

      console.log(`[RabbitWorker:${workerId}] ✅ Acked ${batch.length} events`);
    } catch (err) {
      console.error(`[RabbitWorker:${workerId}] ❌ Flush failed:`, err);

      // Logical failure → send to DLQ
      const lastMsg = batch[batch.length - 1].msg;
      channel.nack(lastMsg, true, false);
    } finally {
      isFlushing = false;
    }
  };


  // Time-based flush (guarantees progress)
  const flushTimer = setInterval(() => {
    flush();
  }, FLUSH_INTERVAL_MS);

  // ================= CONSUMER =================

  channel.consume(QUEUE_NAME, msg => {
    if (!msg) return;

    try {
      const content = JSON.parse(msg.content.toString());

      const event: EventLink = {
        _id: content.id || uuidv4(),
        linkId: content.linkId,
        timestamp: new Date(content.timestamp),
        country: content.country,
        source: content.source,
        context: content.context,
        deviceType: content.deviceType,
      };

      eventBuffer.push({ msg, event });

      if (eventBuffer.length >= MAX_BATCH_SIZE) {
        flush(); // fire, but mutex-protected
      }
    } catch (err) {
      console.error(`[RabbitWorker:${workerId}] ❌ Invalid message:`, err);
      channel.nack(msg, false, false); // malformed → DLQ
    }
  });

  // ================= SHUTDOWN =================

  const shutdown = async () => {
    console.log(`[RabbitWorker:${workerId}] Shutting down…`);
    clearInterval(flushTimer);

    try {
      await flush();
      await channel.close();
      await connection.close();
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
