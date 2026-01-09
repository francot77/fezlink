import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Biopage from '@/app/models/bioPages';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  try {
    await limiter.check(req, 10);
  } catch {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  if (!slug || slug.length < 3) {
    return NextResponse.json({ available: false });
  }

  await dbConnect();
  
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const existing = await Biopage.findOne({ slug });

  // Available if not exists OR if exists but belongs to current user
  const isMine = existing && existing.userId === userId;
  
  return NextResponse.json({
    available: !existing || isMine,
    isMine: !!isMine
  });
}
