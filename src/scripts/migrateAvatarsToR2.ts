import 'dotenv/config';
import dbConnect from '@/lib/mongodb';
import Biopage from '@/app/models/bioPages';
import { r2Client, R2_BUCKET, R2_PUBLIC_BASE_URL } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

const UPLOADTHING_HOSTS = ['utfs.io', 'uploadthing.com'];

async function migrateOne(userId: string, currentUrl: string) {
  try {
    const url = new URL(currentUrl);
    if (!UPLOADTHING_HOSTS.includes(url.hostname)) return null;

    const res = await fetch(currentUrl);
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);

    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    if (!contentType.startsWith('image/')) throw new Error('Not an image');
    const extension =
      contentType === 'image/jpeg' ? 'jpg' : contentType === 'image/png' ? 'png' : 'webp';

    const buffer = Buffer.from(await res.arrayBuffer());
    const key = `avatars/${userId}-${crypto.randomUUID()}.${extension}`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    const newUrl = `${R2_PUBLIC_BASE_URL}/${key}`;
    await Biopage.updateOne({ userId }, { $set: { avatarUrl: newUrl } });
    return newUrl;
  } catch (e) {
    console.error(`Failed to migrate userId=${userId}:`, e);
    return null;
  }
}

async function main() {
  await dbConnect();
  const cursor = Biopage.find({
    avatarUrl: { $exists: true, $ne: '' },
  }).cursor();

  let migrated = 0;
  for await (const doc of cursor) {
    const newUrl = await migrateOne(doc.userId, doc.avatarUrl);
    if (newUrl) migrated++;
  }
  console.log(`Migrated avatars: ${migrated}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
