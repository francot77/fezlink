/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config';
import dbConnect from '@/lib/mongodb';
import Biopage from '@/app/models/bioPages';
import { r2Client, R2_BUCKET } from '@/lib/r2';
import { ListObjectsV2Command, DeleteObjectCommand, _Object } from '@aws-sdk/client-s3';

const PREFIX = 'avatars/';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

async function listAll(): Promise<_Object[]> {
  let contents: _Object[] = [];
  let token: string | undefined;
  do {
    const res = await r2Client.send(
      new ListObjectsV2Command({
        Bucket: R2_BUCKET,
        Prefix: PREFIX,
        ContinuationToken: token,
      })
    );
    contents = contents.concat(res.Contents || []);
    token = res.NextContinuationToken;
  } while (token);
  return contents;
}

async function main() {
  await dbConnect();
  const objects = await listAll();
  const now = Date.now();

  // Obtener todas las URLs de avatar referenciadas
  const allBiopages = await Biopage.find({}, { avatarUrl: 1, _id: 0 }).lean();
  const referenced = new Set(
    allBiopages
      .map((b: any) => {
        const url = b.avatarUrl;
        if (!url) return null;
        try {
          const u = new URL(url);
          return u.pathname.replace(/^\//, '');
        } catch {
          return null;
        }
      })
      .filter(Boolean) as string[]
  );

  let deleted = 0;
  for (const obj of objects) {
    const key = obj.Key!;
    const age = now - new Date(obj.LastModified!).getTime();
    // Si no referenciado y antiguo, eliminar
    if (!referenced.has(key) && age > MAX_AGE_MS) {
      await r2Client.send(
        new DeleteObjectCommand({
          Bucket: R2_BUCKET,
          Key: key,
        })
      );
      deleted++;
    }
  }

  console.log(`Deleted orphan avatar objects: ${deleted}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
