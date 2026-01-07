import { PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import crypto from 'crypto';
import { r2Client, R2_BUCKET, R2_PUBLIC_BASE_URL } from '@/lib/r2';

export async function processAndUploadBackground(buffer: Buffer, userId: string) {
  const webp = await sharp(buffer)
    .resize({ fit: 'cover', position: 'attention' })
    .webp({ quality: 80 })
    .toBuffer();

  const key = `backgrounds/${userId}-${crypto.randomUUID()}.webp`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: webp,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  return `${R2_PUBLIC_BASE_URL}/${key}`;
}

