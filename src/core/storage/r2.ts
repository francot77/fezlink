import { r2Client, R2_BUCKET, R2_PUBLIC_BASE_URL } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function getPresignedPutUrl(key: string, contentType: string, expiresIn = 600) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  });
  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn });
  const publicUrl = `${R2_PUBLIC_BASE_URL}/${key}`;
  return { uploadUrl, publicUrl, expiresIn };
}

