import { NextResponse } from 'next/server';
import { requireAuth } from '@/core/auth';
import { getPresignedPutUrl } from '@/core/storage/r2';
import crypto from 'crypto';

const MAX_SIZE_BYTES = 1 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(req: Request) {
  try {
    const { userId } = await requireAuth();

    const { contentType, size } = await req.json();

    if (!contentType || !ALLOWED_TYPES.has(contentType)) {
      return NextResponse.json({ error: 'Tipo de archivo inválido' }, { status: 400 });
    }

    if (!size || typeof size !== 'number' || size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'El archivo excede el tamaño permitido' }, { status: 400 });
    }

    const extension =
      contentType === 'image/jpeg' ? 'jpg' : contentType === 'image/png' ? 'png' : 'webp';
    const key = `avatars/${userId}-${crypto.randomUUID()}.${extension}`;

    const { uploadUrl, publicUrl, expiresIn } = await getPresignedPutUrl(key, contentType, 600);

    return NextResponse.json({ uploadUrl, key, publicUrl, expiresIn });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'No se pudo generar la URL firmada' }, { status: 500 });
  }
}
