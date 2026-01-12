import dotenv from 'dotenv';
import path from 'path';

// Load env before imports that use process.env
dotenv.config({
  path: path.resolve(process.cwd(), '.env.local'),
});

import dbConnect from '@/lib/mongodb';
import { Link } from '@/app/models/links';
import { v4 as uuidv4 } from 'uuid';

const TARGET_USER_ID = '6964604b5a18b449c156887d';
const NUM_LINKS = 100;

async function seedLinks() {
  console.log(`🌱 Seeding ${NUM_LINKS} links for user ${TARGET_USER_ID}...`);

  try {
    await dbConnect();
    console.log('✅ Connected to MongoDB');

    const linksToCreate = [];

    for (let i = 0; i < NUM_LINKS; i++) {
      linksToCreate.push({
        userId: TARGET_USER_ID,
        destinationUrl: `https://example.com/stress-test/${uuidv4()}`,
        slug: `stress-${Date.now()}-${i}-${Math.random().toString(36).substring(7)}`,
        isActive: true,
      });
    }

    // Insert in bulk
    const result = await Link.insertMany(linksToCreate);

    console.log(`✅ Successfully created ${result.length} links.`);

    // Log first and last ID for reference
    console.log('First Link ID:', result[0]._id);
    console.log('Last Link ID:', result[result.length - 1]._id);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding links:', error);
    process.exit(1);
  }
}

seedLinks();
