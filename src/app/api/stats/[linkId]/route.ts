// app/api/stats/[linkId]/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@/core/auth';
import { getLinkStatsForUser } from '@/core/links/service';

export async function GET(req: Request, { params }: { params: Promise<{ linkId: string }> }) {
  const { userId } = await getAuth();
  const { linkId } = await params;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await getLinkStatsForUser(userId, linkId);
  if (!result.ok && result.reason === 'forbidden') {
    return NextResponse.json({ error: 'Link not found or not yours' }, { status: 403 });
  }
  if (!result.ok && result.reason === 'no_info') {
    return NextResponse.json({ error: 'Not info for this link' });
  }
  return NextResponse.json(result.stats);
}
