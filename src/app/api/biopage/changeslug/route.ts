import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Biopage from '@/app/models/bioPages';
import { requirePremium } from '@/lib/auth-helpers';

export async function PUT(req: Request) {
  try {
    const { userId } = await requirePremium();
    const body = await req.json();
    const { slug } = body;

    await dbConnect();

    const updated = await Biopage.findOneAndUpdate({ userId }, { $set: { slug } }, { new: true });

    if (!updated) {
      return NextResponse.json({ error: 'Biopage not found' }, { status: 404 });
    }

    return NextResponse.json({ newSlug: updated.slug });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Premium subscription required') {
        return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
      }
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
