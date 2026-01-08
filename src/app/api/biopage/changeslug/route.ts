import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Biopage from '@/app/models/bioPages';
import { requirePremium } from '@/lib/auth-helpers';
import { slugSchema } from '@/core/utils/validation';

export async function PUT(req: Request) {
  try {
    const { userId } = await requirePremium();
    const body = await req.json();
    
    const validation = slugSchema.safeParse(body.slug);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message }, 
        { status: 400 }
      );
    }

    const slug = validation.data;

    await dbConnect();
    
    // Check if slug is already taken by another user
    const existing = await Biopage.findOne({ slug });
    if (existing && existing.userId !== userId) {
      return NextResponse.json({ error: 'Slug already taken' }, { status: 409 });
    }

    const updated = await Biopage.findOneAndUpdate(
      { userId }, 
      { $set: { slug } }, 
      { new: true }
    );

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
