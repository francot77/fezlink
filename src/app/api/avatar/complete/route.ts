import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { updateAvatarUrl } from '@/lib/mongodb';
import { R2_PUBLIC_BASE_URL } from '@/lib/r2';

export async function POST(req: Request) {
  try {
    const { userId } = await requireAuth();
    const { key } = await req.json();

    if (!key || typeof key !== 'string' || !key.startsWith('avatars/')) {
      return NextResponse.json({ error: 'Key inválida' }, { status: 400 });
    }

    const url = `${R2_PUBLIC_BASE_URL}/${key}`;
    await updateAvatarUrl(userId, url);

    return NextResponse.json({ url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'No se pudo actualizar el avatar' }, { status: 500 });
  }
}
