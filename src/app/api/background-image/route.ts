// app/api/background-image/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/core/auth';
import { processAndUploadBackground } from '@/core/storage/images';

export async function POST(req: Request) {
  try {
    const { session, userId } = await requireAuth();

    if (!session || !session.isPremium) {
      return NextResponse.json({ error: 'Premium only' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // límites básicos
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const url = await processAndUploadBackground(buffer, userId);

    return NextResponse.json({ url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
