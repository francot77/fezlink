import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GlobalClicks from '@/app/models/globalClicks';

export async function GET() {
  await dbConnect();

  const globalDoc = await GlobalClicks.findOne();

  return NextResponse.json({ count: globalDoc?.count ?? 0 });
}
