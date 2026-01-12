import dotenv from 'dotenv';
import path from 'path';

// Load env before imports that use process.env
dotenv.config({
  path: path.resolve(process.cwd(), '.env.local'),
});

import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { emitAnalyticsEvent, ClickEvent } from '@/lib/emitAnalyticsEvent';
import { v4 as uuidv4 } from 'uuid';

async function main() {
  console.log('--- Manual Test: Emit Analytics Event ---');

  // 1. Connect to DB
  try {
    await dbConnect();
    console.log('✅ Connected to MongoDB');
  } catch (e) {
    console.error('❌ Failed to connect to MongoDB', e);
    process.exit(1);
  }

  // 2. Create Dummy Event
  // Note: linkId must be a valid ObjectId for Mongoose model
  const dummyLinkId = new mongoose.Types.ObjectId();

  const event: ClickEvent = {
    type: 'click',
    linkId: dummyLinkId.toString(),
    userId: 'test-user',
    timestamp: new Date(),
    country: 'TEST_COUNTRY', // Unique to easily find in DB/Logs
    source: 'manual-test',
    deviceType: 'desktop',
    userAgent: 'Mozilla/5.0 (Test)',
    id: uuidv4()
  };

  // 3. Emit
  console.log('Running emitAnalyticsEvent...');
  await emitAnalyticsEvent(event);

  console.log('--- Done ---');
  console.log('Check your RabbitMQ worker logs to see if it received the event.');
  process.exit(0);
}

main().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
