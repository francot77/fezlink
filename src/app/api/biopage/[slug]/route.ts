import Biopage from '@/app/models/bioPages';
import dbConnect from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(req: Request, context: { params: Promise<{ slug?: string }> }) {
  const { slug } = await context.params;

  await dbConnect();
  // Case-insensitive search
  const biopage = await Biopage.findOne({ 
    slug: { $regex: new RegExp(`^${slug}$`, 'i') } 
  });

  if (!biopage) return NextResponse.json({ message: 'No biopage found' }, { status: 404 });
  return NextResponse.json({ biopage });
}
