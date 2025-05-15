import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Biopage from '@/app/models/bioPages';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    const { userId } = await auth();
    if (!userId) return NextResponse.json(null, { status: 401 });

    await dbConnect();

    const biopage = await Biopage.findOne({ userId });
    if (!biopage) return NextResponse.json(null, { status: 404 });

    return NextResponse.json({ biopage });
}
